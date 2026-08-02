const test = require('node:test');
const assert = require('node:assert/strict');
const { db } = require('../config/db');
const { generateHash, signData, verifySignature } = require('../utils/crypto');
const { anchorToBlockchain } = require('../utils/blockchain');
const { v4: uuidv4 } = require('uuid');

test('9. Cryptographic Certificate Revocation & Blockchain Anchoring', () => {
  const uni = db.prepare('SELECT * FROM universities LIMIT 1').get();
  assert.ok(uni, 'University must exist in DB');

  const certId = uuidv4();
  const certNumber = `REVTEST-${Date.now()}`;
  const reason = 'Clerical correction for Phase 7 unit test';
  const revokedAt = new Date().toISOString();

  // RSA Sign Revocation Payload
  const revocationPayload = JSON.stringify({
    certificate_id: certId,
    certificate_number: certNumber,
    reason,
    revoked_at: revokedAt,
    revoked_by: uni.issuer_code,
  });
  const revHash = generateHash(revocationPayload);
  const signature = signData(revHash, uni.private_key);

  // Blockchain Anchor
  const bcAnchor = anchorToBlockchain({
    certHash: revHash,
    certId,
    certNumber,
    issuerCode: uni.issuer_code,
    universityName: uni.name,
  });
  assert.ok(bcAnchor.txId.startsWith('0x'));

  // Insert parent certificate into DB first to satisfy foreign key
  db.prepare(`
    INSERT INTO certificates
      (id, certificate_number, register_number, student_name, student_email, course, cgpa, start_year, end_year, issue_date, certificate_hash, signature, university_id, qr_data, status)
    VALUES (?, ?, 'REG123', 'Revocation Student', 'revoketest@test.com', 'CS', '3.9', '2022', '2026', '2026-08-01', ?, ?, ?, ?, 'VALID')
  `).run(certId, certNumber, revHash, signature, uni.id, revocationPayload);

  // Insert Revocation Record into DB
  const revId = uuidv4();
  db.prepare(`
    INSERT OR REPLACE INTO revoked_certificates
      (id, certificate_id, revoked_by, reason, revoked_at, signature, block_number, tx_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(revId, certId, uni.id, reason, revokedAt, signature, bcAnchor.blockNumber, bcAnchor.txId);

  // Query DB
  const record = db.prepare('SELECT * FROM revoked_certificates WHERE certificate_id = ?').get(certId);
  assert.ok(record);
  assert.equal(record.reason, reason);
  assert.equal(record.signature, signature);

  // Verify RSA signature
  const isValidSig = verifySignature(revHash, record.signature, uni.public_key);
  assert.equal(isValidSig, true);
});
