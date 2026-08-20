const { v4: uuidv4 } = require('uuid');
const { db } = require('../../core/config/db');
const { generateHash, verifySignature, validateReplayProtection } = require('../../core/utils/crypto');
const { logAudit } = require('../../core/utils/auditLogger');
const { verifyOnBlockchain } = require('../../core/utils/blockchain');

const ALGORITHM = 'SHA256-RSA2048';

/**
 * Normalise the signature to hex regardless of how it arrived.
 * New QR codes embed the signature as base64 (sig_enc:'b64') to save space.
 * Legacy QR codes and the certId flow always use hex.
 */
function normaliseSignatureToHex(signature, sigEnc) {
  if (sigEnc === 'b64') {
    return Buffer.from(signature, 'base64').toString('hex');
  }
  return signature; // already hex
}

function verifyCertificate(req, res) {
  try {
    const {
      cert_id: raw_cert_id, id: raw_id, certificate_number, register_number, student_name, course,
      cgpa, start_year, end_year, issue_date, issuer_id, hash, signature,
      sig_enc, scan_nonce, scan_ts,
    } = req.body;
    const cert_id = raw_cert_id || raw_id;

    const verifiedAt       = new Date().toISOString();
    const verificationMode = 'ONLINE';

    // ── Step 0: Replay Protection Check ─────────────────────────────────────────
    // CRITICAL ARCHITECTURAL DISTINCTION:
    // Certificate credential validity NEVER expires. A 10-year-old diploma remains valid.
    // Replay protection applies ONLY to short-lived verification scan session tokens
    // (scan_nonce + scan_ts) to prevent replaying captured verification requests.
    const replayCheck = validateReplayProtection(scan_nonce, scan_ts);
    if (!replayCheck.valid) {
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'FAILURE', resource_id: certificate_number || cert_id, details: { result: 'REPLAY_REJECTED', reason: replayCheck.reason } });
      return res.status(400).json({
        result: 'REPLAY_REJECTED',
        error: 'Replay Protection Failure',
        reason: replayCheck.reason,
        algorithm: ALGORITHM,
        verifiedAt,
        verificationMode,
        hashStatus: 'UNCHECKED',
        signatureStatus: 'UNCHECKED',
      });
    }

    if (!cert_id || !certificate_number || !register_number || !student_name || !course || !end_year || !issue_date || !issuer_id || !hash || !signature) {
      return res.status(400).json({ error: 'Incomplete QR data provided' });
    }

    const cleanIssuerId = (issuer_id || '').replace(/\\/g, '').trim();
    const cleanCertNum  = (certificate_number || '').replace(/\\/g, '').trim();

    let university = db.prepare('SELECT * FROM universities WHERE LOWER(issuer_code) = LOWER(?) OR LOWER(id) = LOWER(?)').get(cleanIssuerId, cleanIssuerId);
    if (!university) {
      const certRec = db.prepare('SELECT university_id FROM certificates WHERE LOWER(id) = LOWER(?) OR LOWER(certificate_number) = LOWER(?) OR LOWER(REPLACE(certificate_number, \'\\\', \'\')) = LOWER(?)').get(cert_id, cleanCertNum, cleanCertNum);
      if (certRec) {
        university = db.prepare('SELECT * FROM universities WHERE id = ?').get(certRec.university_id);
      }
    }

    if (!university) {
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'FAILURE', resource_id: cleanCertNum, details: { result: 'TAMPERED', reason: 'Unknown issuer' } });
      return res.json({
        result: 'TAMPERED', reason: 'Unknown issuer — university not found',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'UNCHECKED', signatureStatus: 'UNCHECKED',
      });
    }

    // ── Step 1: Hash verification ─────────────────────────────────────────────
    const recomputedPayloadRaw = JSON.stringify({
      id:                 cert_id,
      certificate_number: certificate_number,
      register_number:    register_number,
      student_name:       student_name,
      course:             course,
      cgpa:               cgpa        ?? '',
      start_year:         start_year  ?? '',
      end_year:           end_year,
      issue_date:         issue_date,
      issuer_id:          issuer_id,
    });

    const recomputedPayloadClean = JSON.stringify({
      id:                 cert_id,
      certificate_number: cleanCertNum,
      register_number:    (register_number || '').replace(/\\/g, '').trim(),
      student_name:       (student_name || '').trim(),
      course:             (course || '').trim(),
      cgpa:               cgpa        ?? '',
      start_year:         start_year  ?? '',
      end_year:           end_year,
      issue_date:         issue_date,
      issuer_id:          cleanIssuerId,
    });

    const hashRaw   = generateHash(recomputedPayloadRaw);
    const hashClean = generateHash(recomputedPayloadClean);

    const certRecord = db.prepare('SELECT * FROM certificates WHERE LOWER(id) = LOWER(?) OR LOWER(certificate_number) = LOWER(?) OR LOWER(REPLACE(certificate_number, \'\\\', \'\')) = LOWER(?)').get(cert_id, cleanCertNum, cleanCertNum);

    // 1. The payload fields MUST recompute to match the hash provided in the QR payload
    const isPayloadHashValid = (hashRaw === hash || hashClean === hash);

    // 2. If certificate exists in database, the DB certificate_hash MUST match the recomputed hash / QR hash
    let isDbHashValid = true;
    if (certRecord) {
      isDbHashValid = (certRecord.certificate_hash === hash || certRecord.certificate_hash === hashRaw || certRecord.certificate_hash === hashClean);
    }

    const isHashMatch = isPayloadHashValid && isDbHashValid;
    const hashStatus  = isHashMatch ? 'MATCH' : 'MISMATCH';

    const certDetails = {
      id:                 cert_id || certRecord?.id,
      cert_id,
      certificate_number: cleanCertNum,
      register_number:    (register_number || '').replace(/\\/g, '').trim(),
      student_name,
      course,
      cgpa,
      start_year,
      end_year,
      issue_date,
      issuer:               university?.name || 'Issuing University',
      issuer_id:            university?.issuer_code || cleanIssuerId,
      certificate_category: certRecord?.certificate_category || '',
      certificate_detail:   certRecord?.certificate_detail   || '',
    };

    if (hashStatus === 'MISMATCH') {
      recordVerificationEvent(university?.id, cert_id || certRecord?.id, certificate_number, student_name, req.body.verifier_org, 'HASH_MISMATCH', verifiedAt);
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'FAILURE', resource_id: certificate_number, details: { result: 'HASH_MISMATCH' } });
      return res.json({
        result: 'HASH_MISMATCH',
        reason: 'Certificate data has been tampered — SHA-256 hash does not match',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'MISMATCH', signatureStatus: 'UNCHECKED',
        certificate: certDetails,
      });
    }

    // ── Step 2: Signature verification ────────────────────────────────────────
    // Normalise to hex — new QR codes use base64 to save space (sig_enc:'b64')
    const signatureHex = normaliseSignatureToHex(signature, sig_enc);
    let signatureStatus;
    try {
      const sigValid = verifySignature(hash, signatureHex, university.public_key);
      signatureStatus = sigValid ? 'VALID' : 'INVALID';
    } catch (sigErr) {
      recordVerificationEvent(university?.id, cert_id || certRecord?.id, certificate_number, student_name, req.body.verifier_org, 'SIGNATURE_ERROR', verifiedAt);
      return res.json({
        result: 'SIGNATURE_INVALID',
        reason: 'Signature verification error — invalid key format or corrupted signature',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'MATCH', signatureStatus: 'ERROR',
        certificate: certDetails,
      });
    }

    if (signatureStatus === 'INVALID') {
      recordVerificationEvent(university?.id, cert_id || certRecord?.id, certificate_number, student_name, req.body.verifier_org, 'SIGNATURE_INVALID', verifiedAt);
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'FAILURE', resource_id: certificate_number, details: { result: 'SIGNATURE_INVALID' } });
      return res.json({
        result: 'SIGNATURE_INVALID',
        reason: 'Digital signature is invalid — certificate may not be from the stated issuer',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'MATCH', signatureStatus: 'INVALID',
        certificate: certDetails,
      });
    }

    // ── Step 3: Revocation check ──────────────────────────────────────────────
    const cert = certRecord || db.prepare('SELECT * FROM certificates WHERE id = ? OR certificate_number = ?').get(cert_id, certificate_number);
    const revocationRecord = db.prepare('SELECT * FROM revoked_certificates WHERE certificate_id = ? OR certificate_id = ?').get(cert_id, cert?.id);

    if ((cert && cert.status === 'REVOKED') || revocationRecord) {
      let revocationSigValid = true;
      if (revocationRecord && revocationRecord.signature) {
        try {
          const revPayload = JSON.stringify({
            certificate_id: cert?.id || cert_id,
            certificate_number: cert?.certificate_number || certificate_number,
            reason: revocationRecord.reason,
            revoked_at: revocationRecord.revoked_at,
            revoked_by: university.issuer_code,
          });
          const revHash = generateHash(revPayload);
          revocationSigValid = verifySignature(revHash, revocationRecord.signature, university.public_key);
        } catch {
          revocationSigValid = false;
        }
      }

      recordVerificationEvent(university?.id, cert_id || cert?.id, certificate_number, student_name, req.body.verifier_org, 'REVOKED', verifiedAt);
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'SUCCESS', resource_id: certificate_number, details: { result: 'REVOKED', student_name, course, reason: revocationRecord?.reason, revocationSigValid } });
      return res.json({
        result: 'REVOKED',
        reason: revocationRecord?.reason || 'This certificate has been revoked by the issuing university',
        algorithm: ALGORITHM,
        verifiedAt,
        verificationMode,
        hashStatus: 'MATCH',
        signatureStatus: revocationSigValid ? 'VALID' : 'REVOCATION_SIGNATURE_INVALID',
        certificate: certDetails,
        revocation: {
          isRevoked: true,
          revokedAt: revocationRecord?.revoked_at || cert?.created_at,
          revokedBy: university?.name || 'Issuing University',
          reason: revocationRecord?.reason || 'Certificate revoked by issuer',
          signature: revocationRecord?.signature || null,
          signatureVerified: revocationSigValid,
          txId: revocationRecord?.tx_id || null,
          blockNumber: revocationRecord?.block_number || null,
        },
      });
    }

    // ── Step 4: Blockchain anchor verification ────────────────────────────────
    let blockchainResult = { verified: false, reason: 'Not anchored' };
    try {
      const anchor = verifyOnBlockchain(hash);
      if (anchor) {
        blockchainResult = {
          verified:    true,
          txId:        anchor.tx_id,
          blockNumber: anchor.block_number,
          blockHash:   anchor.block_hash,
          anchoredAt:  anchor.anchored_at,
          network:     anchor.network,
          status:      anchor.status,
        };
      }
    } catch (bcErr) {
      console.error('[blockchain] Verify lookup failed:', bcErr.message);
    }

    recordVerificationEvent(university?.id, cert_id || cert?.id, certificate_number, student_name, req.body.verifier_org, 'VALID', verifiedAt);
    logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'SUCCESS', resource_id: certificate_number, details: { result: 'VALID', student_name, course, issuer: university.name } });
    return res.json({
      result: 'VALID',
      message: 'Certificate is authentic and unmodified',
      algorithm: ALGORITHM,
      verifiedAt,
      verificationMode,
      hashStatus:      'MATCH',
      signatureStatus: 'VALID',
      certificate: {
        cert_id, certificate_number, register_number, student_name, course,
        cgpa, start_year, end_year, issue_date, issuer: university.name,
        issuer_id: university.issuer_code,
        certificate_category: cert?.certificate_category || '',
        certificate_detail:   cert?.certificate_detail   || '',
      },
      blockchain: blockchainResult,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

function recordVerificationEvent(universityId, certId, certNumber, studentName, verifierOrg, result, verifiedAt) {
  let targetUniId = universityId;
  if (!targetUniId && (certId || certNumber)) {
    const cert = db.prepare('SELECT university_id FROM certificates WHERE id = ? OR certificate_number = ?').get(certId, certNumber);
    if (cert) targetUniId = cert.university_id;
  }
  if (!targetUniId) return;
  try {
    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO verification_events
        (id, university_id, certificate_id, certificate_number, student_name, verifier_org, verification_result, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, targetUniId, certId || 'UNKNOWN', certNumber || '—', studentName || 'Student', verifierOrg || 'Anonymous Verifier', result, verifiedAt);
  } catch (err) {
    console.error('[verification_events] Log error:', err.message);
  }
}

function getUniversityVerifications(req, res) {
  try {
    const userId = req.user.id;
    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'University not found' });
    }

    const events = db.prepare(`
      SELECT * FROM verification_events
      WHERE university_id = ?
      ORDER BY verified_at DESC
      LIMIT 35
    `).all(university.id);

    const monthlyCount = db.prepare(`
      SELECT COUNT(*) as count FROM verification_events
      WHERE university_id = ?
        AND strftime('%Y-%m', verified_at) = strftime('%Y-%m', 'now')
    `).get(university.id);

    res.json({
      verifications: events,
      totalThisMonth: monthlyCount?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch verification activity' });
  }
}

function getPublicKey(req, res) {
  try {
    const { issuer_id } = req.params;
    const cleanId = (issuer_id || '').replace(/\\/g, '').trim();
    let university = db.prepare('SELECT name, issuer_code, public_key FROM universities WHERE LOWER(issuer_code) = LOWER(?) OR LOWER(id) = LOWER(?)').get(cleanId, cleanId);
    if (!university) {
      return res.status(404).json({ error: `Issuer '${cleanId}' not found` });
    }
    res.json(university);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch public key' });
  }
}

module.exports = { verifyCertificate, getPublicKey, getUniversityVerifications };
