const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generateKeyPair,
  generateHash,
  signData,
  verifySignature,
  generateCertificateNumber,
  generateScanToken,
  validateReplayProtection,
} = require('../utils/crypto');

test('1. RSA-2048 Key Pair Generation', () => {
  const keys = generateKeyPair();
  assert.ok(keys.publicKey.includes('BEGIN PUBLIC KEY'));
  assert.ok(keys.privateKey.includes('BEGIN PRIVATE KEY'));
});

test('2. SHA-256 Hash Generation', () => {
  const hash1 = generateHash('hello world');
  const hash2 = generateHash('hello world');
  const hash3 = generateHash('hello world tampered');
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(hash1.length, 64);
});

test('3. RSA Signature Round-Trip (Valid Payload)', () => {
  const { publicKey, privateKey } = generateKeyPair();
  const payload = 'cert_id_12345:Jane Doe:Computer Science';
  const hash = generateHash(payload);
  const signature = signData(hash, privateKey);
  const isValid = verifySignature(hash, signature, publicKey);
  assert.equal(isValid, true);
});

test('4. RSA Signature Verification Fails on Tampered Payload', () => {
  const { publicKey, privateKey } = generateKeyPair();
  const originalPayload = 'cert_id_12345:Jane Doe:CGPA 3.95';
  const tamperedPayload = 'cert_id_12345:Jane Doe:CGPA 4.00';
  const originalHash = generateHash(originalPayload);
  const tamperedHash = generateHash(tamperedPayload);
  const signature = signData(originalHash, privateKey);
  const isValid = verifySignature(tamperedHash, signature, publicKey);
  assert.equal(isValid, false);
});

test('5. Replay Protection — Fresh Scan Token Passes', () => {
  const token = generateScanToken();
  const res = validateReplayProtection(token.scan_nonce, token.scan_ts);
  assert.equal(res.valid, true);
});

test('6. Replay Protection — Replayed Nonce Rejected', () => {
  const token = generateScanToken();
  validateReplayProtection(token.scan_nonce, token.scan_ts);
  const replayed = validateReplayProtection(token.scan_nonce, token.scan_ts);
  assert.equal(replayed.valid, false);
  assert.ok(replayed.reason.includes('Replay attack detected'));
});

test('7. Replay Protection — Stale Timestamp Rejected', () => {
  const staleTs = Date.now() - (6 * 60 * 1000); // 6 mins ago (>5m)
  const res = validateReplayProtection('nonce_stale_999', staleTs);
  assert.equal(res.valid, false);
  assert.ok(res.reason.includes('expired'));
});

test('8. Certificate Number Generator Format', () => {
  const certNum = generateCertificateNumber('TEST_UNI');
  assert.ok(certNum.startsWith('TEST_UNI-'));
  assert.ok(certNum.includes(`-${new Date().getFullYear()}-`));
});
