const test = require('node:test');
const assert = require('node:assert/strict');
const { db } = require('../config/db');
const { generateHash, signData } = require('../utils/crypto');
const { v4: uuidv4 } = require('uuid');
const { verifyCertificate } = require('../controllers/verificationController');

const { getOrCreateTestUniversity } = require('./testHelper');

test('10. End-to-End Verification Controller Flow', () => {
  const uni = getOrCreateTestUniversity();

  const certId = uuidv4();
  const certNum = `TESTVERIF-${Date.now()}`;
  const regNo = 'REG999';
  const name = 'Verification Test Student';
  const course = 'Cybersecurity';

  const payload = JSON.stringify({
    id: certId,
    certificate_number: certNum,
    register_number: regNo,
    student_name: name,
    course,
    cgpa: '3.85',
    start_year: '2022',
    end_year: '2026',
    issue_date: '2026-08-01',
    issuer_id: uni.issuer_code,
  });

  const hash = generateHash(payload);
  const signature = signData(hash, uni.private_key);

  // Insert into certificates DB
  db.prepare(`
    INSERT INTO certificates
      (id, certificate_number, register_number, student_name, student_email, course, cgpa, start_year, end_year, issue_date, certificate_hash, signature, university_id, qr_data, status)
    VALUES (?, ?, ?, ?, 'verif@test.com', ?, '3.85', '2022', '2026', '2026-08-01', ?, ?, ?, ?, 'VALID')
  `).run(certId, certNum, regNo, name, course, hash, signature, uni.id, payload);

  // Mock req / res objects
  const req = {
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    body: {
      cert_id: certId,
      certificate_number: certNum,
      register_number: regNo,
      student_name: name,
      course,
      cgpa: '3.85',
      start_year: '2022',
      end_year: '2026',
      issue_date: '2026-08-01',
      issuer_id: uni.issuer_code,
      hash,
      signature,
    },
  };

  let responseData = null;
  const res = {
    json: (data) => { responseData = data; return res; },
    status: () => res,
  };

  verifyCertificate(req, res);

  assert.ok(responseData, 'Response data must be returned');
  assert.equal(responseData.result, 'VALID');
  assert.equal(responseData.hashStatus, 'MATCH');
  assert.equal(responseData.signatureStatus, 'VALID');
});

test('11. Verification Fails on Hash Mismatch (Data Tampering)', () => {
  const uni = db.prepare('SELECT * FROM universities LIMIT 1').get();

  const req = {
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
    body: {
      cert_id: 'fake-id',
      certificate_number: 'FAKE-123',
      register_number: 'REG000',
      student_name: 'Tampered Student',
      course: 'Data Science',
      cgpa: '4.00', // Tampered CGPA
      start_year: '2022',
      end_year: '2026',
      issue_date: '2026-08-01',
      issuer_id: uni.issuer_code,
      hash: 'fake_hash_1234567890123456789012345678901234567890123456789012345678901234',
      signature: 'fake_sig',
    },
  };

  let responseData = null;
  const res = {
    json: (data) => { responseData = data; return res; },
    status: () => res,
  };

  verifyCertificate(req, res);

  assert.ok(responseData);
  assert.equal(responseData.result, 'HASH_MISMATCH');
  assert.equal(responseData.hashStatus, 'MISMATCH');
});
