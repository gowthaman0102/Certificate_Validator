const crypto = require('crypto');

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return { publicKey, privateKey };
}

function normalizeCertificateValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? '' : trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return String(value);
}

function buildCertificatePayload(data = {}) {
  const normalized = {
    id: normalizeCertificateValue(data.id ?? data.cert_id),
    certificate_number: normalizeCertificateValue(data.certificate_number),
    register_number: normalizeCertificateValue(data.register_number),
    student_name: normalizeCertificateValue(data.student_name),
    course: normalizeCertificateValue(data.course),
    cgpa: normalizeCertificateValue(data.cgpa),
    start_year: normalizeCertificateValue(data.start_year),
    end_year: normalizeCertificateValue(data.end_year),
    issue_date: normalizeCertificateValue(data.issue_date),
    issuer_id: normalizeCertificateValue(data.issuer_id),
  };

  return JSON.stringify(normalized);
}

function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function signData(data, privateKey) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

function verifySignature(data, signature, publicKey) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
}

function createCertificateHashAndSignature(data, privateKey) {
  const payload = buildCertificatePayload(data);
  const certificateHash = generateHash(payload);
  const signature = signData(certificateHash, privateKey);
  return { payload, certificateHash, signature };
}

// Generates a clean, human-readable certificate number like "UNI001-2026-A3F9"
function generateCertificateNumber(issuerCode) {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${issuerCode}-${year}-${randomPart}`;
}

module.exports = {
  generateKeyPair,
  generateHash,
  signData,
  verifySignature,
  generateCertificateNumber,
  normalizeCertificateValue,
  buildCertificatePayload,
  createCertificateHashAndSignature,
};
