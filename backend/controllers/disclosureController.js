/**
 * disclosureController.js
 * Selective Disclosure Controller
 * Generates and verifies field-level RSA-2048 signed predicate claims (e.g. "CGPA >= 3.5")
 * without exposing the student's full transcript or private identity.
 */

const { db } = require('../config/db');
const { generateHash, signData, verifySignature } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a signed selective disclosure for a certificate claim.
 * Must be student-authenticated (or university admin).
 * Refuses to issue signed claim if predicate is false.
 */
function createDisclosure(req, res) {
  try {
    const certId = req.params.id;
    const { claim_type, claim_value } = req.body;

    if (!claim_type) {
      return res.status(400).json({ error: 'claim_type is required' });
    }

    // Fetch certificate record
    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certId);
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Fetch issuing university
    const uni = db.prepare('SELECT * FROM universities WHERE id = ?').get(cert.university_id);
    if (!uni) {
      return res.status(404).json({ error: 'Issuing university not found' });
    }

    // Evaluate predicate condition
    let isValidClaim = false;
    let claimDescription = '';
    let predicateStr = '';

    const targetValue = claim_value || '3.5';

    switch (claim_type) {
      case 'cgpa_gte': {
        const certCgpa = parseFloat(cert.cgpa || 0);
        const threshold = parseFloat(targetValue);
        isValidClaim = certCgpa >= threshold;
        predicateStr = `cgpa >= ${threshold}`;
        claimDescription = `Student holds academic CGPA ≥ ${threshold} (Actual record satisfies claim)`;
        break;
      }
      case 'graduated_by': {
        const gradYear = parseInt(cert.end_year || 0, 10);
        const targetYear = parseInt(targetValue, 10);
        isValidClaim = gradYear <= targetYear;
        predicateStr = `end_year <= ${targetYear}`;
        claimDescription = `Degree conferred in or prior to academic year ${targetYear}`;
        break;
      }
      case 'course_match': {
        isValidClaim = (cert.course || '').toLowerCase().includes(targetValue.toLowerCase());
        predicateStr = `course matches '${targetValue}'`;
        claimDescription = `Field of study matches '${targetValue}'`;
        break;
      }
      case 'status_valid': {
        isValidClaim = cert.status === 'VALID';
        predicateStr = 'status == VALID';
        claimDescription = 'Certificate credential is valid and active (Not Revoked)';
        break;
      }
      default:
        return res.status(400).json({ error: `Unsupported claim_type '${claim_type}'` });
    }

    // Explicit Refusal for False Predicates
    if (!isValidClaim) {
      return res.status(400).json({
        error: `Predicate condition '${predicateStr}' is NOT satisfied by certificate. Server refuses to sign false claims.`,
        claim_satisfied: false,
      });
    }

    const disclosureId = `DISC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const issuedAt = new Date().toISOString();

    // Canonical disclosure payload string
    const canonicalPayload = JSON.stringify({
      disclosure_id: disclosureId,
      certificate_id: cert.id,
      claim_type,
      claim_predicate: predicateStr,
      claim_description: claimDescription,
      result: true,
      original_cert_hash: cert.certificate_hash,
      issuer_code: uni.issuer_code,
      issued_at: issuedAt,
    });

    const payloadHash = generateHash(canonicalPayload);
    const signature = signData(payloadHash, uni.private_key);

    // Save disclosure record to database
    db.prepare(`
      INSERT INTO disclosures
        (id, certificate_id, claim_type, claim_predicate, claim_description, result, original_cert_hash, university_id, issuer_code, university_name, signature, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `).run(
      disclosureId,
      cert.id,
      claim_type,
      predicateStr,
      claimDescription,
      cert.certificate_hash,
      uni.id,
      uni.issuer_code,
      uni.name,
      signature,
      issuedAt
    );

    return res.json({
      status: 'success',
      disclosure_id: disclosureId,
      certificate_id: cert.id,
      claim_type,
      claim_predicate: predicateStr,
      claim_description: claimDescription,
      result: true,
      signature,
      university_name: uni.name,
      issuer_code: uni.issuer_code,
      issued_at: issuedAt,
      shareable_url: `/disclosure/${disclosureId}`,
      privacy_guarantee: 'RSA-2048 signed field-level claim. Zero full transcript or student identity data exposed.',
    });
  } catch (err) {
    console.error('Error creating disclosure:', err);
    return res.status(500).json({ error: 'Failed to create selective disclosure' });
  }
}

/**
 * Publicly verify a selective disclosure claim.
 * No authentication required.
 * Returns verified claim status without revealing underlying student identity or transcript.
 */
function verifyDisclosure(req, res) {
  try {
    const { disclosureId } = req.params;

    const record = db.prepare('SELECT * FROM disclosures WHERE id = ?').get(disclosureId);
    if (!record) {
      return res.status(404).json({ error: 'Disclosure claim record not found' });
    }

    const uni = db.prepare('SELECT * FROM universities WHERE id = ?').get(record.university_id);
    if (!uni) {
      return res.status(404).json({ error: 'Issuing university record not found' });
    }

    // Reconstruct canonical payload for signature verification
    const canonicalPayload = JSON.stringify({
      disclosure_id: record.id,
      certificate_id: record.certificate_id,
      claim_type: record.claim_type,
      claim_predicate: record.claim_predicate,
      claim_description: record.claim_description,
      result: Boolean(record.result),
      original_cert_hash: record.original_cert_hash,
      issuer_code: record.issuer_code,
      issued_at: record.created_at,
    });

    const payloadHash = generateHash(canonicalPayload);
    const isValidSig = verifySignature(payloadHash, record.signature, uni.public_key);

    return res.json({
      result: isValidSig ? 'VALID' : 'INVALID_SIGNATURE',
      disclosure_id: record.id,
      claim_type: record.claim_type,
      claim_predicate: record.claim_predicate,
      claim_description: record.claim_description,
      claim_result: Boolean(record.result),
      original_cert_hash: record.original_cert_hash,
      university_name: record.university_name,
      issuer_code: record.issuer_code,
      issued_at: record.created_at,
      signatureStatus: isValidSig ? 'VALID' : 'INVALID',
      signature: record.signature,
      privacy_guarantee: 'Field-level RSA-2048 signed predicate claim. Zero student identity or full transcript data exposed.',
    });
  } catch (err) {
    console.error('Error verifying disclosure:', err);
    return res.status(500).json({ error: 'Failed to verify selective disclosure' });
  }
}

module.exports = {
  createDisclosure,
  verifyDisclosure,
};
