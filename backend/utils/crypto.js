const crypto = require('crypto');

function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return { publicKey, privateKey };
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

// Generates a clean, human-readable certificate number like "UNI001-2026-A3F9"
function generateCertificateNumber(issuerCode) {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${issuerCode}-${year}-${randomPart}`;
}

module.exports = { generateKeyPair, generateHash, signData, verifySignature, generateCertificateNumber };
