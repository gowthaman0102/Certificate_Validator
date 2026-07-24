const { db } = require('../config/db');
const { generateHash, verifySignature } = require('../utils/crypto');
const { logAudit } = require('../utils/auditLogger');
const { verifyOnBlockchain } = require('../utils/blockchain');

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
      cert_id, certificate_number, register_number, student_name, course,
      cgpa, start_year, end_year, issue_date, issuer_id, hash, signature,
      sig_enc,
    } = req.body;

    const verifiedAt       = new Date().toISOString();
    const verificationMode = 'ONLINE';

    if (!cert_id || !certificate_number || !register_number || !student_name || !course || !end_year || !issue_date || !issuer_id || !hash || !signature) {
      return res.status(400).json({ error: 'Incomplete QR data provided' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE issuer_code = ?').get(issuer_id);
    if (!university) {
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'FAILURE', resource_id: certificate_number, details: { result: 'TAMPERED', reason: 'Unknown issuer' } });
      return res.json({
        result: 'TAMPERED', reason: 'Unknown issuer — university not found',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'UNCHECKED', signatureStatus: 'UNCHECKED',
      });
    }

    // ── Step 1: Hash verification ─────────────────────────────────────────────
    // CRITICAL: must be IDENTICAL to the JSON.stringify used at issuance time
    // (certificateController.js lines 61-72). The issuance code uses plain
    // JSON.stringify + explicit '||''' coercions — NOT buildCertificatePayload.
    const recomputedPayload = JSON.stringify({
      id:                 cert_id,
      certificate_number: certificate_number,
      register_number:    register_number,
      student_name:       student_name,
      course:             course,
      cgpa:               cgpa        ?? '',   // null from DB → '' to match issuance
      start_year:         start_year  ?? '',   // null from DB → '' to match issuance
      end_year:           end_year,
      issue_date:         issue_date,
      issuer_id:          issuer_id,
    });
    const recomputedHash = generateHash(recomputedPayload);
    const hashStatus     = recomputedHash === hash ? 'MATCH' : 'MISMATCH';

    const certRecord = db.prepare('SELECT * FROM certificates WHERE id = ? OR certificate_number = ?').get(cert_id, certificate_number);
    const certDetails = {
      id:                 cert_id || certRecord?.id,
      cert_id,
      certificate_number,
      register_number,
      student_name,
      course,
      cgpa,
      start_year,
      end_year,
      issue_date,
      issuer:               university?.name || 'Issuing University',
      issuer_id:            university?.issuer_code || issuer_id,
      certificate_category: certRecord?.certificate_category || '',
      certificate_detail:   certRecord?.certificate_detail   || '',
    };

    if (hashStatus === 'MISMATCH') {
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
      return res.json({
        result: 'SIGNATURE_INVALID',
        reason: 'Signature verification error — invalid key format or corrupted signature',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'MATCH', signatureStatus: 'ERROR',
        certificate: certDetails,
      });
    }

    if (signatureStatus === 'INVALID') {
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
    const cert = certRecord || db.prepare('SELECT * FROM certificates WHERE id = ?').get(cert_id);
    if (cert && cert.status === 'REVOKED') {
      logAudit(req, { module: 'VERIFICATION', action: 'VERIFY', status: 'SUCCESS', resource_id: certificate_number, details: { result: 'REVOKED', student_name, course } });
      return res.json({
        result: 'REVOKED', reason: 'This certificate has been revoked by the issuer',
        algorithm: ALGORITHM, verifiedAt, verificationMode,
        hashStatus: 'MATCH', signatureStatus: 'VALID',
        certificate: certDetails,
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

function getPublicKey(req, res) {
  try {
    const { issuer_id } = req.params;
    const university = db.prepare('SELECT name, issuer_code, public_key FROM universities WHERE issuer_code = ?').get(issuer_id);
    if (!university) {
      return res.status(404).json({ error: 'Issuer not found' });
    }
    res.json(university);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch public key' });
  }
}

module.exports = { verifyCertificate, getPublicKey };
