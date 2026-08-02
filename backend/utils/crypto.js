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

/**
 * REPLAY PROTECTION HELPERS
 * 
 * CRITICAL ARCHITECTURAL DISTINCTION:
 * - Certificate credentials DO NOT expire. A degree issued 10 years ago remains valid forever.
 * - Replay protection applies strictly to live verification scan session tokens (scan_nonce, scan_ts).
 * - This prevents captured verification session payloads from being replayed by adversaries
 *   to spoof fresh verification contexts or flood the system.
 */
const PROCESSED_NONCES = new Map();
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes scan session window

function generateScanToken() {
  return {
    scan_nonce: crypto.randomBytes(16).toString('hex'),
    scan_ts: Date.now(),
  };
}

function validateReplayProtection(scanNonce, scanTs) {
  if (!scanNonce && !scanTs) {
    return { valid: true }; // Direct/legacy certificate verification without session wrapper
  }

  const now = Date.now();

  // 1. Timestamp freshness check (scan session window)
  if (scanTs) {
    const tsNum = Number(scanTs);
    if (isNaN(tsNum)) {
      return { valid: false, reason: 'Invalid scan timestamp format' };
    }
    const diff = Math.abs(now - tsNum);
    if (diff > REPLAY_WINDOW_MS) {
      return { valid: false, reason: `Scan session token expired (older than ${REPLAY_WINDOW_MS / 1000}s). Certificate remains valid — please re-scan.` };
    }
  }

  // 2. Nonce uniqueness check (prevents replayed request payload)
  if (scanNonce) {
    if (PROCESSED_NONCES.has(scanNonce)) {
      return { valid: false, reason: 'Replay attack detected — this verification scan session has already been used.' };
    }

    PROCESSED_NONCES.set(scanNonce, now);

    // Periodic memory cleanup
    if (PROCESSED_NONCES.size > 500) {
      for (const [nonce, ts] of PROCESSED_NONCES.entries()) {
        if (now - ts > REPLAY_WINDOW_MS * 2) {
          PROCESSED_NONCES.delete(nonce);
        }
      }
    }
  }

  return { valid: true };
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
  generateScanToken,
  validateReplayProtection,
};
