const test = require('node:test');
const assert = require('node:assert/strict');
const { db } = require('../config/db');
const { generateHash, signData, verifySignature } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');
const { createDisclosure, verifyDisclosure } = require('../controllers/disclosureController');

test('13. Selective Disclosure — Valid Predicate, Refused False Predicate & Tampered Signature Verification', () => {
  const uni = db.prepare('SELECT * FROM universities LIMIT 1').get();
  assert.ok(uni, 'University must exist in DB');

  const certId = uuidv4();
  const certNumber = `DISC-TEST-${Date.now()}`;

  // Insert a test certificate with CGPA = 3.85, end_year = 2026, course = Computer Science
  db.prepare(`
    INSERT INTO certificates
      (id, certificate_number, register_number, student_name, student_email, course, cgpa, start_year, end_year, issue_date, certificate_hash, signature, university_id, qr_data, status)
    VALUES (?, ?, 'REG_DISC_01', 'Disclosure Student', 'disc@test.com', 'Computer Science', '3.85', '2022', '2026', '2026-08-01', 'hash_disc_123', 'sig_disc_123', ?, 'qr_disc', 'VALID')
  `).run(certId, certNumber, uni.id);

  // ---------------------------------------------------------------------------
  // 13a. Generate Disclosure for TRUE Predicate (CGPA >= 3.5 on CGPA = 3.85)
  // ---------------------------------------------------------------------------
  const reqTrue = {
    params: { id: certId },
    body: { claim_type: 'cgpa_gte', claim_value: '3.5' },
    user: { id: 'student_123', role: 'STUDENT' },
  };

  let trueResData = null;
  const resTrue = {
    json: (data) => { trueResData = data; return resTrue; },
    status: () => resTrue,
  };

  createDisclosure(reqTrue, resTrue);

  assert.ok(trueResData, 'Response must be returned');
  assert.equal(trueResData.status, 'success');
  assert.equal(trueResData.result, true);
  assert.ok(trueResData.disclosure_id.startsWith('DISC-'));
  assert.ok(trueResData.signature, 'RSA-2048 signature must be generated');

  // ---------------------------------------------------------------------------
  // 13b. Public Independent Signature Verification of Disclosure
  // ---------------------------------------------------------------------------
  const reqVerify = {
    params: { disclosureId: trueResData.disclosure_id },
  };

  let verifyResData = null;
  const resVerify = {
    json: (data) => { verifyResData = data; return resVerify; },
    status: () => resVerify,
  };

  verifyDisclosure(reqVerify, resVerify);

  assert.ok(verifyResData);
  assert.equal(verifyResData.result, 'VALID');
  assert.equal(verifyResData.signatureStatus, 'VALID');
  assert.equal(verifyResData.claim_result, true);
  assert.ok(verifyResData.privacy_guarantee.includes('Zero student identity'));

  // ---------------------------------------------------------------------------
  // 13c. Refuse False Predicate (CGPA >= 3.95 on CGPA = 3.85 -> MUST FAIL)
  // ---------------------------------------------------------------------------
  const reqFalse = {
    params: { id: certId },
    body: { claim_type: 'cgpa_gte', claim_value: '3.95' },
    user: { id: 'student_123', role: 'STUDENT' },
  };

  let falseResData = null;
  let falseStatus = 200;
  const resFalse = {
    json: (data) => { falseResData = data; return resFalse; },
    status: (code) => { falseStatus = code; return resFalse; },
  };

  createDisclosure(reqFalse, resFalse);

  assert.equal(falseStatus, 400, 'Server must return 400 Bad Request for false claim');
  assert.ok(falseResData.error.includes('NOT satisfied'), 'Error message must state predicate not satisfied');

  // ---------------------------------------------------------------------------
  // 13d. Verify Tampered Disclosure Signature
  // ---------------------------------------------------------------------------
  // Reconstruct payload with tampered predicate text and test signature
  const canonicalTampered = JSON.stringify({
    disclosure_id: trueResData.disclosure_id,
    certificate_id: certId,
    claim_type: 'cgpa_gte',
    claim_predicate: 'cgpa >= 4.0', // Tampered predicate
    claim_description: 'Tampered claim description',
    result: true,
    original_cert_hash: 'hash_disc_123',
    issuer_code: uni.issuer_code,
    issued_at: trueResData.issued_at,
  });

  const tamperedHash = generateHash(canonicalTampered);
  const isTamperedValid = verifySignature(tamperedHash, trueResData.signature, uni.public_key);
  assert.equal(isTamperedValid, false, 'Tampered disclosure payload must fail signature verification');
});
