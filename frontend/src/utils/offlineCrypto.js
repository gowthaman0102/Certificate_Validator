/**
 * offlineCrypto.js
 *
 * Client-side cryptographic verification using the Web Crypto API.
 * No network calls — works 100% offline once a public key is cached.
 *
 * Algorithm: RSA-PKCS1v1.5 with SHA-256  (matches backend crypto.js)
 * Key format: RSA-2048 SPKI PEM
 *
 * Result shape returned by verifyOffline():
 * {
 *   result:          'VALID' | 'HASH_MISMATCH' | 'SIGNATURE_INVALID' | 'TAMPERED' | 'ERROR',
 *   reason:          string,
 *   message:         string (only on VALID),
 *   algorithm:       'SHA256-RSA2048',
 *   verifiedAt:      ISO string,
 *   verificationMode:'OFFLINE',
 *   hashStatus:      'MATCH' | 'MISMATCH' | 'UNCHECKED',
 *   signatureStatus: 'VALID' | 'INVALID' | 'UNCHECKED' | 'ERROR',
 *   certificate:     { ... } (only on VALID)
 * }
 */

const ALGORITHM = 'SHA256-RSA2048';

// ─── Internal crypto helpers ──────────────────────────────────────────────────

async function importPublicKey(pemKey) {
  const pemContents = pemKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  const binaryDer = base64ToArrayBuffer(pemContents);
  return window.crypto.subtle.importKey(
    'spki',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    true,
    ['verify']
  );
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyRsaSignature(data, signatureHex, publicKeyPem) {
  const publicKey = await importPublicKey(publicKeyPem);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const signatureBuffer = hexToArrayBuffer(signatureHex);
  return window.crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    publicKey,
    signatureBuffer,
    dataBuffer
  );
}

// ─── Payload normalization (must exactly match backend buildCertificatePayload) ─

function normalizeValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') { const t = value.trim(); return t === '' ? '' : t; }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return String(value);
}

function buildNormalizedPayload(payload) {
  const normalized = {
    id:                 normalizeValue(payload.id ?? payload.cert_id),
    certificate_number: normalizeValue(payload.certificate_number),
    register_number:    normalizeValue(payload.register_number),
    student_name:       normalizeValue(payload.student_name),
    course:             normalizeValue(payload.course),
    cgpa:               normalizeValue(payload.cgpa),
    start_year:         normalizeValue(payload.start_year),
    end_year:           normalizeValue(payload.end_year),
    issue_date:         normalizeValue(payload.issue_date),
    issuer_id:          normalizeValue(payload.issuer_id),
  };
  return JSON.stringify(normalized);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Verifies a certificate QR payload entirely offline using the Web Crypto API.
 *
 * Steps performed:
 *  1. Recompute SHA-256 hash from QR fields and compare with stored hash
 *  2. Verify RSA-PKCS1v1.5 signature on the hash using the issuer's public key
 *
 * @param {Object} qrPayload   — Decoded QR JSON object
 * @param {string} publicKeyPem — RSA-2048 SPKI PEM string
 * @returns {Promise<Object>}  — Granular verification result
 */
export async function verifyOffline(qrPayload, publicKeyPem) {
  const verifiedAt = new Date().toISOString();
  const base = {
    algorithm:        ALGORITHM,
    verifiedAt,
    verificationMode: 'OFFLINE',
  };

  const {
    cert_id, certificate_number, register_number,
    student_name, course, cgpa, start_year, end_year,
    issue_date, issuer_id, hash, signature,
  } = qrPayload;

  // ── Step 1: Hash verification ──────────────────────────────────────────────
  let hashStatus = 'UNCHECKED';
  let recomputedHash;

  try {
    const recomputedPayload = buildNormalizedPayload({
      cert_id, certificate_number, register_number, student_name,
      course, cgpa, start_year, end_year, issue_date, issuer_id,
    });
    recomputedHash = await sha256Hex(recomputedPayload);
    hashStatus = recomputedHash === hash ? 'MATCH' : 'MISMATCH';
  } catch (hashErr) {
    return {
      ...base,
      result:          'ERROR',
      reason:          'Hash computation failed: ' + hashErr.message,
      hashStatus:      'UNCHECKED',
      signatureStatus: 'UNCHECKED',
    };
  }

  if (hashStatus === 'MISMATCH') {
    return {
      ...base,
      result:          'HASH_MISMATCH',
      reason:          'Certificate data has been tampered — SHA-256 hash does not match',
      hashStatus,
      signatureStatus: 'UNCHECKED',
    };
  }

  // ── Step 2: Signature verification ────────────────────────────────────────
  let signatureStatus = 'UNCHECKED';

  try {
    const sigValid = await verifyRsaSignature(hash, signature, publicKeyPem);
    signatureStatus = sigValid ? 'VALID' : 'INVALID';
  } catch (sigErr) {
    return {
      ...base,
      result:          'SIGNATURE_INVALID',
      reason:          'Signature verification error — invalid key format or corrupted signature',
      hashStatus,
      signatureStatus: 'ERROR',
    };
  }

  if (signatureStatus === 'INVALID') {
    return {
      ...base,
      result:          'SIGNATURE_INVALID',
      reason:          'Digital signature is invalid — certificate may not be from the stated issuer',
      hashStatus,
      signatureStatus,
    };
  }

  // ── Both checks passed ─────────────────────────────────────────────────────
  return {
    ...base,
    result:          'VALID',
    message:         'Certificate is authentic and unmodified (verified offline)',
    hashStatus,
    signatureStatus,
    certificate: {
      cert_id, certificate_number, register_number, student_name,
      course, cgpa, start_year, end_year, issue_date, issuer_id,
    },
  };
}
