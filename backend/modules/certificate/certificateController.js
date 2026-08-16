const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { db } = require('../../core/config/db');
const { generateHash, signData, generateCertificateNumber } = require('../../core/utils/crypto');
const { logAudit } = require('../../core/utils/auditLogger');
const { anchorToBlockchain } = require('../../core/utils/blockchain');

// Categories that may only be issued once per student (same university)
const RESTRICTED_CATEGORIES = new Set([
  'Degree / Graduation Certificate',
  'Merit Certificate',
  'Distinction Certificate',
]);

const NEEDS_DETAIL_CATEGORIES = new Set([
  'Course Completion Certificate',
  'Internship Completion Certificate',
  'Project Completion Certificate',
  'Participation Certificate',
  'Bonafide Certificate',
]);

function normalizeCategoryName(rawCategory) {
  if (!rawCategory) return '';
  const str = String(rawCategory).trim().toLowerCase();

  if (str.includes('gradua') || str.includes('degree')) return 'Degree / Graduation Certificate';
  if (str.includes('intern')) return 'Internship Completion Certificate';
  if (str.includes('project')) return 'Project Completion Certificate';
  if (str.includes('distinc')) return 'Distinction Certificate';
  if (str.includes('merit')) return 'Merit Certificate';
  if (str.includes('bonafide')) return 'Bonafide Certificate';
  if (str.includes('participat')) return 'Participation Certificate';
  if (str.includes('excel')) return 'Academic Excellence Certificate';
  if (str.includes('course')) return 'Course Completion Certificate';

  return String(rawCategory).trim();
}

/**
 * Strict 3-way credential verification helper:
 * Ensures student_name, register_number, and student_email are all provided
 * and that all 3 belong to the exact same student record (in `users` table or existing `certificates`).
 */
function verifyStudentCredentials(student_name, register_number, student_email) {
  const normName  = (student_name || '').trim().replace(/\s+/g, ' ');
  const normRegNo = (register_number || '').trim();
  const normEmail = (student_email || '').trim().toLowerCase();

  if (!normName || !normRegNo || !normEmail) {
    return {
      valid: false,
      error: 'Student Name, Register Number, and Student Email are all required to issue a certificate.'
    };
  }

  // Helper for flexible name matching (case-insensitive, whitespace-normalized)
  const isNameMatch = (nameA, nameB) => {
    const a = (nameA || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const b = (nameB || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return a === b || a.includes(b) || b.includes(a);
  };

  // 1. Check registered student accounts in `users` table
  const userByEmail = db.prepare("SELECT * FROM users WHERE role = 'STUDENT' AND LOWER(email) = ?").get(normEmail);
  const userByRegNo = db.prepare("SELECT * FROM users WHERE role = 'STUDENT' AND register_number = ?").get(normRegNo);

  if (userByEmail || userByRegNo) {
    // If student exists by both, ensure both query results point to the same user ID
    if (userByEmail && userByRegNo && userByEmail.id !== userByRegNo.id) {
      return {
        valid: false,
        error: 'Credential Verification Failed: Provided Email and Register Number belong to two different registered students.'
      };
    }

    const user = userByEmail || userByRegNo;

    // Verify email match
    if (user.email && user.email.trim().toLowerCase() !== normEmail) {
      return {
        valid: false,
        error: `Credential Verification Failed: Provided Email does not match the registered record for Register Number '${normRegNo}'.`
      };
    }

    // Verify register number match
    if (user.register_number && user.register_number.trim() !== normRegNo) {
      return {
        valid: false,
        error: `Credential Verification Failed: Provided Register Number does not match the registered record for email '${normEmail}'.`
      };
    }

    // Verify student name match
    if (user.name && !isNameMatch(user.name, normName)) {
      return {
        valid: false,
        error: 'Credential Verification Failed: Provided Student Name does not match the registered student record.'
      };
    }

    return { valid: true, studentUserId: user.id };
  }

  // 2. Check existing certificates in `certificates` table for non-registered students
  const certByEmail = db.prepare("SELECT * FROM certificates WHERE LOWER(student_email) = ? AND status != 'REVOKED' LIMIT 1").get(normEmail);
  const certByRegNo = db.prepare("SELECT * FROM certificates WHERE register_number = ? AND status != 'REVOKED' LIMIT 1").get(normRegNo);

  if (certByEmail || certByRegNo) {
    if (certByEmail && certByRegNo && (certByEmail.register_number !== certByRegNo.register_number || certByEmail.student_email?.toLowerCase() !== certByRegNo.student_email?.toLowerCase())) {
      return {
        valid: false,
        error: 'Credential Verification Failed: Provided Email and Register Number are linked to different students in prior certificate records.'
      };
    }

    const existingCert = certByEmail || certByRegNo;

    if (existingCert.student_email && existingCert.student_email.trim().toLowerCase() !== normEmail) {
      return {
        valid: false,
        error: `Credential Verification Failed: Provided Email does not match existing records for Register Number '${normRegNo}'.`
      };
    }

    if (existingCert.register_number && existingCert.register_number.trim() !== normRegNo) {
      return {
        valid: false,
        error: `Credential Verification Failed: Provided Register Number does not match existing records for email '${normEmail}'.`
      };
    }

    if (existingCert.student_name && !isNameMatch(existingCert.student_name, normName)) {
      return {
        valid: false,
        error: 'Credential Verification Failed: Provided Student Name does not match existing records.'
      };
    }
  }

  return { valid: true, studentUserId: null };
}

async function uploadCertificate(req, res) {
  try {
    const { student_name, student_email, register_number, course, cgpa, start_year, end_year, issue_date,
            certificate_category, certificate_detail } = req.body;
    const userId = req.user.id;

    if (!student_name || !register_number || !student_email || !course || !end_year || !issue_date) {
      return res.status(400).json({ error: 'student_name, register_number, student_email, course, end_year, and issue_date are required' });
    }
    if (!certificate_category) {
      return res.status(400).json({ error: 'certificate_category is required' });
    }

    // ── Strict 3-way credential verification (Name, Register Number, Student Email) ──
    const credCheck = verifyStudentCredentials(student_name, register_number, student_email);
    if (!credCheck.valid) {
      return res.status(400).json({ error: credCheck.error });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'Only a registered university can issue certificates' });
    }

    // ── Duplicate restriction check ───────────────────────────────────────────
    const normalizedRegNo  = register_number.trim();
    const normalizedEmail  = student_email ? student_email.trim().toLowerCase() : null;
    const certCategory     = normalizeCategoryName(certificate_category);
    const certDetail       = (certificate_detail   || '').trim();

    if (RESTRICTED_CATEGORIES.has(certCategory)) {
      const duplicate = db.prepare(`
        SELECT id FROM certificates
        WHERE certificate_category = ?
          AND (
            (register_number = ? AND register_number != '')
            OR (student_email IS NOT NULL AND student_email != '' AND LOWER(student_email) = LOWER(?))
            OR (LOWER(student_name) = LOWER(?))
          )
          AND status != 'REVOKED'
      `).get(certCategory, normalizedRegNo, normalizedEmail || '', student_name.trim());

      if (duplicate) {
        return res.status(409).json({
          error: `This student has already been issued a ${certCategory}. Only one certificate of this type may be issued per student across all institutions.`
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
      university_name:    university.name,
      certificate_category: certCategory,
      certificate_detail: certDetail || '',
      hash:               certificateHash,
      signature:          signatureB64,
      sig_enc:            'b64',
    };
    const qrData = JSON.stringify(qrPayload);

    const qrFileName = `qr_${certificateId}.png`;
    const qrFilePath = path.join(__dirname, '..', '..', 'uploads', qrFileName);
    await QRCode.toFile(qrFilePath, qrData, { width: 1200, errorCorrectionLevel: 'H' });

    db.prepare(`
      INSERT INTO certificates
        (id, certificate_number, register_number, student_name, student_email, student_user_id, course, cgpa,
         start_year, end_year, issue_date, certificate_hash, signature, university_id,
         file_path, qr_data, status, certificate_category, certificate_detail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', ?, ?)
    `).run(
      certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail, credCheck.studentUserId || null,
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

    logAudit(req, {
      module: 'CERTIFICATE', action: 'ISSUE', status: 'SUCCESS',
      resource_id: certificateId,
      details: { certificate_number: certificateNumber, student_name, register_number: normalizedRegNo, course, university: university.name },
    });

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
  } catch (err) {
    console.error(err);
    logAudit(req, {
      module: 'CERTIFICATE', action: 'ISSUE', status: 'FAILURE',
      details: { error: err.message, student_name: req.body?.student_name },
    });
    res.status(500).json({ error: err.message || 'Failed to issue certificate' });
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
    let trimmed = (certNumber || '').replace(/\\/g, '').trim();
    // Handle accidental double-concatenated paste e.g. ABCABC
    const half = Math.floor(trimmed.length / 2);
    if (trimmed.length > 6 && trimmed.length % 2 === 0 && trimmed.substring(0, half) === trimmed.substring(half)) {
      trimmed = trimmed.substring(0, half);
    }
    const cert = db.prepare(`
      SELECT c.*, u.name as university_name, u.issuer_code
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE LOWER(c.certificate_number) = LOWER(?)
         OR LOWER(c.id) = LOWER(?)
         OR LOWER(REPLACE(c.certificate_number, '\\', '')) = LOWER(?)
    `).get(trimmed, trimmed, trimmed);
    if (!cert) {
      return res.status(404).json({ error: `Certificate '${trimmed}' not found in system registry` });
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
        const student_name    = (row.student_name || '').trim();
        const register_number = (row.register_number || '').trim();
        const course          = (row.course || '').trim();
        const cgpa            = (row.cgpa || '').trim();
        const end_year        = (row.end_year || '').trim();
        const start_year      = (row.start_year || '').trim();
        const student_email   = (row.student_email || '').trim();
        const issue_date      = (row.issue_date || '').trim() || new Date().toISOString().split('T')[0];
        const certCategory    = normalizeCategoryName(row.certificate_category);
        const certDetail      = (row.certificate_detail   || '').trim();

        if (!certCategory) {
          results.push({ row: rowNum, register_number: register_number || '(missing)', success: false, reason: 'missing_fields', error: "Missing mandatory field: 'Certificate Category' must be specified in Excel row" });
          continue;
        }

        if (!student_name || !register_number || !student_email || !course || !cgpa || !end_year) {
          const missing = [];
          if (!student_name) missing.push('Student Name');
          if (!register_number) missing.push('Register Number');
          if (!student_email) missing.push('Student Email');
          if (!course) missing.push('Department / Course');
          if (!cgpa) missing.push('CGPA');
          if (!end_year) missing.push('Year of Passing');
          results.push({ row: rowNum, register_number: register_number || '(missing)', success: false, reason: 'missing_fields', error: `Missing mandatory field(s): ${missing.join(', ')}` });
          continue;
        }

        if (NEEDS_DETAIL_CATEGORIES.has(certCategory) && !certDetail) {
          results.push({ row: rowNum, register_number: register_number || '(missing)', success: false, reason: 'missing_fields', error: `Missing mandatory field: 'Certificate Detail' is required for '${certCategory}'` });
          continue;
        }

        const normalizedRegNo  = String(register_number).trim();
        const normalizedEmail  = String(student_email).trim().toLowerCase();

        // ── Strict 3-way credential verification ─────────────────────────────
        const credCheck = verifyStudentCredentials(student_name, normalizedRegNo, normalizedEmail);
        if (!credCheck.valid) {
          results.push({ row: rowNum, register_number: normalizedRegNo, student_name, success: false, reason: 'credential_mismatch', error: credCheck.error });
          continue;
        }

        // ── Duplicate restriction check ───────────────────────────────────────
        if (RESTRICTED_CATEGORIES.has(certCategory)) {
          const duplicate = db.prepare(`
            SELECT id FROM certificates
            WHERE certificate_category = ?
              AND (
                (register_number = ? AND register_number != '')
                OR (student_email IS NOT NULL AND student_email != '' AND LOWER(student_email) = LOWER(?))
                OR (LOWER(student_name) = LOWER(?))
              )
              AND status != 'REVOKED'
          `).get(certCategory, normalizedRegNo, normalizedEmail || '', student_name.trim());

          if (duplicate) {
            results.push({ row: rowNum, register_number: normalizedRegNo, student_name, success: false, reason: 'duplicate_restricted', error: `Already has a ${certCategory} across institutions` });
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
          university_name:    university.name,
          certificate_category: certCategory,
          certificate_detail: certDetail || '',
          hash:               certificateHash,
          signature:          signatureB64,
          sig_enc:            'b64',
        };
        const qrData = JSON.stringify(qrPayload);

        const qrFileName = `qr_${certificateId}.png`;
        const qrFilePath = path.join(__dirname, '..', '..', 'uploads', qrFileName);
        await QRCode.toFile(qrFilePath, qrData, { width: 1200, errorCorrectionLevel: 'H' });

        db.prepare(`
          INSERT INTO certificates
            (id, certificate_number, register_number, student_name, student_email, student_user_id, course, cgpa,
             start_year, end_year, issue_date, certificate_hash, signature, university_id,
             file_path, qr_data, status, certificate_category, certificate_detail)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', ?, ?)
        `).run(
          certificateId, certificateNumber, normalizedRegNo, student_name, normalizedEmail, credCheck.studentUserId || null,
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
    const cleanEmail = (email || '').trim();
    const cleanRegNo = (registerNumber || '').trim();

    let certs;
    if (cleanEmail && cleanRegNo) {
      certs = db.prepare(`
        SELECT c.*, u.name as university_name
        FROM certificates c
        LEFT JOIN universities u ON c.university_id = u.id
        WHERE (LOWER(c.student_email) = LOWER(?) OR (c.register_number = ? AND c.register_number != ''))
        ORDER BY c.created_at DESC
      `).all(cleanEmail, cleanRegNo);
    } else if (cleanRegNo) {
      certs = db.prepare(`
        SELECT c.*, u.name as university_name
        FROM certificates c
        LEFT JOIN universities u ON c.university_id = u.id
        WHERE c.register_number = ?
        ORDER BY c.created_at DESC
      `).all(cleanRegNo);
    } else {
      certs = db.prepare(`
        SELECT c.*, u.name as university_name
        FROM certificates c
        LEFT JOIN universities u ON c.university_id = u.id
        WHERE LOWER(c.student_email) = LOWER(?)
        ORDER BY c.created_at DESC
      `).all(cleanEmail);
    }
    res.json(certs);
  } catch (err) {
    console.error('getCertificatesByIdentity error:', err);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
}

async function revokeCertificate(req, res) {
  try {
    const userId = req.user.id;
    const certId = req.params.id || req.body.certificate_id || req.body.id;
    const reason = (req.body.reason || 'Revoked by issuing university').trim();

    if (!certId) {
      return res.status(400).json({ error: 'Certificate ID is required' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ? OR id = ?').get(userId, userId);
    if (!university) {
      return res.status(403).json({ error: 'Only registered universities can revoke certificates' });
    }

    const cert = db.prepare(`
      SELECT c.*, u.issuer_code, u.name as university_name
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ? OR c.certificate_number = ?
    `).get(certId, certId);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (cert.university_id !== university.id && cert.university_id !== university.user_id) {
      return res.status(403).json({ error: 'You are not authorized to revoke certificates issued by another university' });
    }

    const existingRevocation = db.prepare('SELECT * FROM revoked_certificates WHERE certificate_id = ?').get(cert.id);
    if (cert.status === 'REVOKED' || existingRevocation) {
      return res.status(400).json({ error: 'Certificate is already revoked', revocation: existingRevocation });
    }

    const revocationId = uuidv4();
    const revokedAt = new Date().toISOString();

    let signature = null;
    try {
      if (university.private_key) {
        const revocationPayload = JSON.stringify({
          certificate_id: cert.id,
          certificate_number: cert.certificate_number,
          reason,
          revoked_at: revokedAt,
          revoked_by: university.issuer_code,
        });
        const revHash = generateHash(revocationPayload);
        signature = signData(revHash, university.private_key);
      }
    } catch (sigErr) {
      console.warn('[revoke] Notice signing revocation:', sigErr.message);
    }

    let bcAnchor = null;
    try {
      bcAnchor = anchorToBlockchain({
        certHash: generateHash(cert.id + reason + revokedAt),
        certId: cert.id,
        certNumber: cert.certificate_number,
        issuerCode: university.issuer_code,
        universityName: university.name,
      });
    } catch (bcErr) {
      console.warn('[blockchain] Revocation anchor notice:', bcErr.message);
    }

    db.prepare("UPDATE certificates SET status = 'REVOKED' WHERE id = ?").run(cert.id);

    try {
      db.prepare(`
        INSERT INTO revoked_certificates
          (id, certificate_id, revoked_by, reason, revoked_at, signature, block_number, tx_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        revocationId,
        cert.id,
        university.issuer_code || university.id,
        reason,
        revokedAt,
        signature,
        bcAnchor?.blockNumber || null,
        bcAnchor?.txId || null
      );
    } catch (insertErr) {
      console.warn('[revoke] Insert into revoked_certificates notice:', insertErr.message);
    }

    logAudit(req, {
      module: 'CERTIFICATE',
      action: 'REVOKE',
      status: 'SUCCESS',
      resource_id: cert.certificate_number,
      details: { reason, university: university.name, revokedAt, txId: bcAnchor?.txId },
    });

    return res.status(200).json({
      message: 'Certificate successfully revoked',
      revocation: {
        id: revocationId,
        certificate_id: cert.id,
        certificate_number: cert.certificate_number,
        reason,
        revoked_at: revokedAt,
        signature,
        blockchain: bcAnchor ? { anchored: true, txId: bcAnchor.txId, blockNumber: bcAnchor.blockNumber } : { anchored: false },
      },
    });
  } catch (err) {
    console.error('[revokeCertificate] error:', err);
    return res.status(500).json({ error: err.message || 'Failed to revoke certificate' });
  }
}

function getRevocationStatus(req, res) {
  try {
    const certId = req.params.id;
    const cert = db.prepare(`
      SELECT c.*, u.name as university_name, u.issuer_code
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ? OR c.certificate_number = ?
    `).get(certId, certId);

    if (!cert) {
      return res.status(404).json({ is_revoked: false, error: 'Certificate not found' });
    }

    const revocation = db.prepare('SELECT * FROM revoked_certificates WHERE certificate_id = ?').get(cert.id);
    if (!revocation && cert.status !== 'REVOKED') {
      return res.json({ is_revoked: false, certificate_number: cert.certificate_number });
    }

    res.json({
      is_revoked: true,
      certificate_id: cert.id,
      certificate_number: cert.certificate_number,
      reason: revocation?.reason || 'Certificate revoked by issuer',
      revoked_at: revocation?.revoked_at || cert.created_at,
      signature: revocation?.signature,
      block_number: revocation?.block_number,
      tx_id: revocation?.tx_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch revocation status' });
  }
}

module.exports = {
  uploadCertificate,
  getCertificate,
  getCertificateByCertNumber,
  getCertificatesByUniversity,
  getCertificatesByEmail,
  getCertificatesByRegisterNumber,
  bulkUploadCertificates,
  getCertificatesByIdentity,
  revokeCertificate,
  getRevocationStatus,
};

