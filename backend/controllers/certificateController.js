const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');
const { generateHash, signData, generateCertificateNumber } = require('../utils/crypto');

async function uploadCertificate(req, res) {
  try {
    const { student_name, student_email, register_number, course, cgpa, start_year, end_year, issue_date } = req.body;
    const userId = req.user.id;

    if (!student_name || !register_number || !course || !cgpa || !end_year || !issue_date) {
      return res.status(400).json({ error: 'student_name, register_number, course, cgpa, end_year, and issue_date are required' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'Only a registered university can issue certificates' });
    }

    const certificateId = uuidv4();
    const certificateNumber = generateCertificateNumber(university.issuer_code);
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const normalizedEmail = student_email ? student_email.trim().toLowerCase() : null;
    const normalizedRegNo = register_number.trim();

    const certPayload = JSON.stringify({
      id: certificateId,
      certificate_number: certificateNumber,
      register_number: normalizedRegNo,
      student_name,
      course,
      cgpa,
      start_year: start_year || '',
      end_year,
      issue_date,
      issuer_id: university.issuer_code
    });

    const certificateHash = generateHash(certPayload);
    const signature = signData(certificateHash, university.private_key);

    const qrPayload = {
      cert_id: certificateId,
      certificate_number: certificateNumber,
      register_number: normalizedRegNo,
      student_name,
      course,
      cgpa,
      start_year: start_year || '',
      end_year,
      issue_date,
      issuer_id: university.issuer_code,
      hash: certificateHash,
      signature: signature
    };
    const qrData = JSON.stringify(qrPayload);

    const qrFileName = `qr_${certificateId}.png`;
    const qrFilePath = path.join(__dirname, '..', 'uploads', qrFileName);
    await QRCode.toFile(qrFilePath, qrData, { width: 400 });

    db.prepare(`
      INSERT INTO certificates (id, certificate_number, register_number, student_name, student_email, course, cgpa, start_year, end_year, issue_date, certificate_hash, signature, university_id, file_path, qr_data, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID')
    `).run(certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail, course, cgpa, start_year || null, end_year, issue_date, certificateHash, signature, university.id, filePath, qrData);

    res.status(201).json({
      message: 'Certificate issued successfully',
      certificate: {
        id: certificateId,
        certificate_number: certificateNumber,
        register_number: normalizedRegNo,
        student_name,
        student_email: normalizedEmail,
        course,
        cgpa,
        start_year: start_year || '',
        end_year,
        issue_date,
        hash: certificateHash,
        qr_code_url: `/uploads/${qrFileName}`,
        file_url: filePath,
        status: 'VALID',
        university_name: university.name,
        issuer_id: university.issuer_code,
        signature: signature
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to issue certificate', debug: err.message });
  }
}

function getCertificate(req, res) {
  try {
    const { id } = req.params;
    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id);
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
}

function getCertificateByCertNumber(req, res) {
  try {
    const { certNumber } = req.params;
    const cert = db.prepare(`
      SELECT c.*, u.name as university_name, u.issuer_code
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.certificate_number = ?
    `).get(certNumber);
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found for this ID' });
    }
    res.json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
}

function getCertificatesByUniversity(req, res) {
  try {
    const { id } = req.params;
    const certs = db.prepare('SELECT * FROM certificates WHERE university_id = ? ORDER BY created_at DESC').all(id);
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

function getCertificatesByEmail(req, res) {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'email query parameter is required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const certs = db.prepare(`
      SELECT c.*, u.name as university_name
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.student_email = ?
      ORDER BY c.created_at DESC
    `).all(normalizedEmail);
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

function getCertificatesByRegisterNumber(req, res) {
  try {
    const { registerNumber } = req.query;
    if (!registerNumber) {
      return res.status(400).json({ error: 'registerNumber query parameter is required' });
    }
    const normalized = registerNumber.trim();
    const certs = db.prepare(`
      SELECT c.*, u.name as university_name
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.register_number = ?
      ORDER BY c.created_at DESC
    `).all(normalized);
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

module.exports = { uploadCertificate, getCertificate, getCertificateByCertNumber, getCertificatesByUniversity, getCertificatesByEmail, getCertificatesByRegisterNumber, bulkUploadCertificates };

async function bulkUploadCertificates(req, res) {
  try {
    const userId = req.user.id;
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'rows must be a non-empty array' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'Only a registered university can issue certificates' });
    }

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // account for header row in the original sheet

      try {
        const student_name = row.student_name;
        const register_number = row.register_number;
        const course = row.course;
        const cgpa = row.cgpa;
        const end_year = row.end_year;
        const start_year = row.start_year || '';
        const student_email = row.student_email || null;
        const issue_date = row.issue_date || new Date().toISOString().split('T')[0];

        if (!student_name || !register_number || !course || !cgpa || !end_year) {
          results.push({ row: rowNum, register_number: register_number || '(missing)', success: false, error: 'Missing required field(s)' });
          continue;
        }

        const certificateId = uuidv4();
        const certificateNumber = generateCertificateNumber(university.issuer_code);
        const normalizedEmail = student_email ? String(student_email).trim().toLowerCase() : null;
        const normalizedRegNo = String(register_number).trim();

        const certPayload = JSON.stringify({
          id: certificateId,
          certificate_number: certificateNumber,
          register_number: normalizedRegNo,
          student_name,
          course,
          cgpa: String(cgpa),
          start_year: String(start_year),
          end_year: String(end_year),
          issue_date,
          issuer_id: university.issuer_code
        });

        const certificateHash = generateHash(certPayload);
        const signature = signData(certificateHash, university.private_key);

        const qrPayload = {
          cert_id: certificateId,
          certificate_number: certificateNumber,
          register_number: normalizedRegNo,
          student_name,
          course,
          cgpa: String(cgpa),
          start_year: String(start_year),
          end_year: String(end_year),
          issue_date,
          issuer_id: university.issuer_code,
          hash: certificateHash,
          signature: signature
        };
        const qrData = JSON.stringify(qrPayload);

        const qrFileName = `qr_${certificateId}.png`;
        const qrFilePath = path.join(__dirname, '..', 'uploads', qrFileName);
        await QRCode.toFile(qrFilePath, qrData, { width: 400 });

        db.prepare(`
          INSERT INTO certificates (id, certificate_number, register_number, student_name, student_email, course, cgpa, start_year, end_year, issue_date, certificate_hash, signature, university_id, file_path, qr_data, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID')
        `).run(certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail, course, String(cgpa), String(start_year), String(end_year), issue_date, certificateHash, signature, university.id, null, qrData);

        results.push({ row: rowNum, register_number: normalizedRegNo, student_name, certificate_number: certificateNumber, success: true });
      } catch (rowErr) {
        console.error('Bulk row error:', rowErr);
        results.push({ row: rowNum, register_number: row.register_number || '(unknown)', success: false, error: rowErr.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    res.json({
      message: `Bulk issuance complete: ${successCount} of ${rows.length} succeeded`,
      total: rows.length,
      succeeded: successCount,
      failed: rows.length - successCount,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk issuance failed', debug: err.message });
  }
}
