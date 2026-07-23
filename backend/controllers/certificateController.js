const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/db');
const { generateHash, signData, generateCertificateNumber } = require('../utils/crypto');
const { logAudit } = require('../utils/auditLogger');
const { anchorToBlockchain } = require('../utils/blockchain');

// Categories that may only be issued once per student (same university)
const RESTRICTED_CATEGORIES = new Set([
  'Degree / Graduation Certificate',
  'Merit Certificate',
  'Distinction Certificate',
]);

async function uploadCertificate(req, res) {
  try {
    const { student_name, student_email, register_number, course, cgpa, start_year, end_year, issue_date,
            certificate_category, certificate_detail } = req.body;
    const userId = req.user.id;

    if (!student_name || !register_number || !course || !end_year || !issue_date) {
      return res.status(400).json({ error: 'student_name, register_number, course, end_year, and issue_date are required' });
    }
    if (!certificate_category) {
      return res.status(400).json({ error: 'certificate_category is required' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'Only a registered university can issue certificates' });
    }

    // ── Duplicate restriction check ───────────────────────────────────────────
    const normalizedRegNo  = register_number.trim();
    const normalizedEmail  = student_email ? student_email.trim().toLowerCase() : null;
    const certCategory     = (certificate_category || '').trim();
    const certDetail       = (certificate_detail   || '').trim();

    if (RESTRICTED_CATEGORIES.has(certCategory)) {
      const duplicate = db.prepare(`
        SELECT id FROM certificates
        WHERE university_id = ?
          AND certificate_category = ?
          AND (register_number = ? OR (student_email IS NOT NULL AND student_email = ?))
          AND status != 'REVOKED'
      `).get(university.id, certCategory, normalizedRegNo, normalizedEmail || '');

      if (duplicate) {
        return res.status(409).json({
          error: `This student has already been issued a ${certCategory}. Only one certificate of this type may be issued per student.`
        });
      }
    }

    const certificateId     = uuidv4();
    const certificateNumber = generateCertificateNumber(university.issuer_code);
    const filePath          = req.file ? `/uploads/${req.file.filename}` : null;

    const certPayload = JSON.stringify({
      id: certificateId,
      certificate_number: certificateNumber,
      register_number: normalizedRegNo,
      student_name,
      course,
      cgpa: cgpa || '',
      start_year: start_year || '',
      end_year,
      issue_date,
      issuer_id: university.issuer_code
    });

    const certificateHash = generateHash(certPayload);
    const signature = signData(certificateHash, university.private_key);

    // Encode signature as base64 (saves ~168 chars vs hex, keeping QR density low)
    const signatureB64 = Buffer.from(signature, 'hex').toString('base64');

    const qrPayload = {
      cert_id:            certificateId,
      certificate_number: certificateNumber,
      register_number:    normalizedRegNo,
      student_name,
      course,
      cgpa:               cgpa || '',
      start_year:         start_year || '',
      end_year,
      issue_date,
      issuer_id:          university.issuer_code,
      hash:               certificateHash,
      signature:          signatureB64,
      sig_enc:            'b64',
    };
    const qrData = JSON.stringify(qrPayload);

    const qrFileName = `qr_${certificateId}.png`;
    const qrFilePath = path.join(__dirname, '..', 'uploads', qrFileName);
    await QRCode.toFile(qrFilePath, qrData, { width: 1200, errorCorrectionLevel: 'H' });

    db.prepare(`
      INSERT INTO certificates
        (id, certificate_number, register_number, student_name, student_email, course, cgpa,
         start_year, end_year, issue_date, certificate_hash, signature, university_id,
         file_path, qr_data, status, certificate_category, certificate_detail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', ?, ?)
    `).run(
      certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail,
      course, cgpa || null, start_year || null, end_year, issue_date,
      certificateHash, signature, university.id, filePath, qrData,
      certCategory, certDetail || null
    );

    // ── Blockchain hash anchoring (non-blocking) ──────────────────────────────
    let blockchainAnchor = null;
    try {
      blockchainAnchor = anchorToBlockchain({
        certHash:       certificateHash,
        certId:         certificateId,
        certNumber:     certificateNumber,
        issuerCode:     university.issuer_code,
        universityName: university.name,
      });
    } catch (bcErr) {
      console.error('[blockchain] Anchor failed (cert still issued):', bcErr.message);
    }

    res.status(201).json({
      message: 'Certificate issued successfully',
      certificate: {
        id: certificateId,
        certificate_number: certificateNumber,
        register_number: normalizedRegNo,
        student_name,
        student_email: normalizedEmail,
        course,
        cgpa: cgpa || '',
        start_year: start_year || '',
        end_year,
        issue_date,
        certificate_category: certCategory,
        certificate_detail:   certDetail,
        hash: certificateHash,
        qr_code_url: `/uploads/${qrFileName}`,
        file_url: filePath,
        status: 'VALID',
        university_name: university.name,
        issuer_id: university.issuer_code,
        signature: signature
      },
      blockchain: blockchainAnchor ? {
        anchored:    true,
        txId:        blockchainAnchor.txId,
        blockNumber: blockchainAnchor.blockNumber,
        anchoredAt:  blockchainAnchor.anchoredAt,
        network:     blockchainAnchor.network,
      } : { anchored: false },
    });

    logAudit(req, {
      module: 'CERTIFICATE', action: 'ISSUE', status: 'SUCCESS',
      resource_id: certificateId,
      details: { certificate_number: certificateNumber, student_name, register_number: normalizedRegNo, course, university: university.name },
    });
  } catch (err) {
    console.error(err);
    logAudit(req, {
      module: 'CERTIFICATE', action: 'ISSUE', status: 'FAILURE',
      details: { error: err.message, student_name: req.body?.student_name },
    });
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
      const rowNum = i + 2;

      try {
        const student_name    = row.student_name;
        const register_number = row.register_number;
        const course          = row.course;
        const cgpa            = row.cgpa;
        const end_year        = row.end_year;
        const start_year      = row.start_year || '';
        const student_email   = row.student_email || null;
        const issue_date      = row.issue_date || new Date().toISOString().split('T')[0];
        const certCategory    = (row.certificate_category || 'Course Completion Certificate').trim();
        const certDetail      = (row.certificate_detail   || '').trim();

        if (!student_name || !register_number || !course || !end_year) {
          results.push({ row: rowNum, register_number: register_number || '(missing)', success: false, reason: 'missing_fields', error: 'Missing required field(s)' });
          continue;
        }

        const normalizedRegNo  = String(register_number).trim();
        const normalizedEmail  = student_email ? String(student_email).trim().toLowerCase() : null;

        // ── Duplicate restriction check ───────────────────────────────────────
        if (RESTRICTED_CATEGORIES.has(certCategory)) {
          const duplicate = db.prepare(`
            SELECT id FROM certificates
            WHERE university_id = ?
              AND certificate_category = ?
              AND (register_number = ? OR (student_email IS NOT NULL AND student_email = ?))
              AND status != 'REVOKED'
          `).get(university.id, certCategory, normalizedRegNo, normalizedEmail || '');

          if (duplicate) {
            results.push({ row: rowNum, register_number: normalizedRegNo, student_name, success: false, reason: 'duplicate_restricted', error: `Already has a ${certCategory}` });
            continue;
          }
        }

        const certificateId = uuidv4();
        const certificateNumber = generateCertificateNumber(university.issuer_code);

        const certPayload = JSON.stringify({
          id: certificateId,
          certificate_number: certificateNumber,
          register_number: normalizedRegNo,
          student_name,
          course,
          cgpa: cgpa || '',           // MUST match single-upload: cgpa || ''
          start_year: start_year || '', // MUST match single-upload: start_year || ''
          end_year,                   // plain value, no String() cast
          issue_date,
          issuer_id: university.issuer_code
        });

        const certificateHash = generateHash(certPayload);
        const signature = signData(certificateHash, university.private_key);

        // Encode signature as base64 for compact QR
        const signatureB64 = Buffer.from(signature, 'hex').toString('base64');

        const qrPayload = {
          cert_id:            certificateId,
          certificate_number: certificateNumber,
          register_number:    normalizedRegNo,
          student_name,
          course,
          cgpa:               cgpa || '',           // matches certPayload
          start_year:         start_year || '',     // matches certPayload
          end_year,                                 // plain value
          issue_date,
          issuer_id:          university.issuer_code,
          hash:               certificateHash,
          signature:          signatureB64,
          sig_enc:            'b64',
        };
        const qrData = JSON.stringify(qrPayload);

        const qrFileName = `qr_${certificateId}.png`;
        const qrFilePath = path.join(__dirname, '..', 'uploads', qrFileName);
        await QRCode.toFile(qrFilePath, qrData, { width: 1200, errorCorrectionLevel: 'H' });

        db.prepare(`
          INSERT INTO certificates
            (id, certificate_number, register_number, student_name, student_email, course, cgpa,
             start_year, end_year, issue_date, certificate_hash, signature, university_id,
             file_path, qr_data, status, certificate_category, certificate_detail)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', ?, ?)
        `).run(
          certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail,
          course, cgpa || null, start_year || null, end_year, issue_date,
          certificateHash, signature, university.id, null, qrData,
          certCategory, certDetail || null
        );

        // ── Blockchain hash anchoring (non-blocking per row) ──────────────────
        let bcAnchor = null;
        try {
          bcAnchor = anchorToBlockchain({
            certHash:       certificateHash,
            certId:         certificateId,
            certNumber:     certificateNumber,
            issuerCode:     university.issuer_code,
            universityName: university.name,
          });
        } catch (bcErr) {
          console.error('[blockchain] Bulk anchor failed for row', rowNum, ':', bcErr.message);
        }

        results.push({
          row: rowNum,
          register_number: normalizedRegNo,
          student_name,
          certificate_number: certificateNumber,
          certificate_category: certCategory,
          success: true,
          blockchain: bcAnchor ? { anchored: true, txId: bcAnchor.txId, blockNumber: bcAnchor.blockNumber } : { anchored: false },
        });
      } catch (rowErr) {
        console.error('Bulk row error:', rowErr);
        results.push({ row: rowNum, register_number: row.register_number || '(unknown)', success: false, error: rowErr.message });
      }
    }

    const successCount   = results.filter((r) => r.success).length;
    const skippedRestricted = results.filter((r) => !r.success && r.reason === 'duplicate_restricted').length;
    const failedOther    = results.filter((r) => !r.success && r.reason !== 'duplicate_restricted').length;
    logAudit(req, {
      module: 'CERTIFICATE', action: 'BULK_ISSUE', status: successCount > 0 ? 'SUCCESS' : 'FAILURE',
      details: { total: rows.length, succeeded: successCount, skipped_restricted: skippedRestricted, failed: failedOther, university: university.name },
    });
    res.json({
      message: `Bulk issuance complete: ${successCount} of ${rows.length} issued, ${skippedRestricted} skipped (duplicate restricted).`,
      total: rows.length,
      succeeded: successCount,
      skipped_restricted: skippedRestricted,
      failed: failedOther,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bulk issuance failed', debug: err.message });
  }
}

function getCertificatesByIdentity(req, res) {
  try {
    const { email, registerNumber } = req.query;
    if (!registerNumber && !email) {
      return res.status(400).json({ error: 'email or registerNumber query parameter is required' });
    }
    let certs;
    if (registerNumber) {
      const normalized = registerNumber.trim();
      certs = db.prepare(`
        SELECT c.*, u.name as university_name
        FROM certificates c
        JOIN universities u ON c.university_id = u.id
        WHERE c.register_number = ?
        ORDER BY c.created_at DESC
      `).all(normalized);
    } else {
      const normalized = email.trim();
      certs = db.prepare(`
        SELECT c.*, u.name as university_name
        FROM certificates c
        JOIN universities u ON c.university_id = u.id
        WHERE c.student_email = ?
        ORDER BY c.created_at DESC
      `).all(normalized);
    }
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

module.exports = { uploadCertificate, getCertificate, getCertificateByCertNumber, getCertificatesByUniversity, getCertificatesByEmail, getCertificatesByRegisterNumber, bulkUploadCertificates, getCertificatesByIdentity };
