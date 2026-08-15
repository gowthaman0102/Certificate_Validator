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

async function verifyRsaSignature(data, signatureRaw, publicKeyPem, sigEnc) {
  const publicKey = await importPublicKey(publicKeyPem);
  const encoder   = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  // Support both base64 (new QR format) and hex (legacy QR format)
  const sigBuffer = sigEnc === 'b64'
    ? base64ToArrayBuffer(signatureRaw)
    : hexToArrayBuffer(signatureRaw);
  return window.crypto.subtle.verify(
    { name: 'RSASSA-PKCS1-v1_5' },
    publicKey,
    sigBuffer,
    dataBuffer
  );
}

// ─── Payload builder — MUST be byte-for-byte identical to issuance ───────────
// Issuance (certificateController.js lines 61-72) uses plain JSON.stringify
// with explicit `cgpa || ''` and `start_year || ''` coercions and field order
// exactly as shown below. Any deviation produces a different hash.

function buildNormalizedPayload(payload) {
  // The QR already stores cgpa/start_year as '' (from issuance `|| ''` coercions)
  // so they arrive here as strings. We still guard with ?? '' for safety.
  return JSON.stringify({
    id:                 payload.id ?? payload.cert_id,
    certificate_number: payload.certificate_number,
    register_number:    payload.register_number,
    student_name:       payload.student_name,
    course:             payload.course,
    cgpa:               payload.cgpa       ?? '',
    start_year:         payload.start_year ?? '',
    end_year:           payload.end_year,
    issue_date:         payload.issue_date,
    issuer_id:          payload.issuer_id,
  });
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
    sig_enc,   // 'b64' for new QR codes, undefined/absent for legacy hex QR codes
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

  const certDetails = {
    id: cert_id,
    cert_id,
    certificate_number,
    register_number,
    student_name,
    course,
    cgpa,
    start_year,
    end_year,
    issue_date,
    issuer_id,
    issuer_code: qrPayload.issuer_code || qrPayload.issuer_id || issuer_id,
    university_name: qrPayload.university_name || '',
    certificate_category: qrPayload.certificate_category || '',
    certificate_detail: qrPayload.certificate_detail || '',
  };

  if (hashStatus === 'MISMATCH') {
    return {
      ...base,
      result:          'HASH_MISMATCH',
      reason:          'Certificate data has been tampered — SHA-256 hash does not match',
      hashStatus,
      signatureStatus: 'UNCHECKED',
      certificate: certDetails,
    };
  }

  // ── Step 2: Signature verification ────────────────────────────────────────
  let signatureStatus = 'UNCHECKED';

  try {
    const sigValid = await verifyRsaSignature(hash, signature, publicKeyPem, sig_enc);
    signatureStatus = sigValid ? 'VALID' : 'INVALID';
  } catch (sigErr) {
    return {
      ...base,
      result:          'SIGNATURE_INVALID',
      reason:          'Signature verification error — invalid key format or corrupted signature',
      hashStatus,
      signatureStatus: 'ERROR',
      certificate: certDetails,
    };
  }

  if (signatureStatus === 'INVALID') {
    return {
      ...base,
      result:          'SIGNATURE_INVALID',
      reason:          'Digital signature is invalid — certificate may not be from the stated issuer',
      hashStatus,
      signatureStatus,
      certificate: certDetails,
    };
  }

  // ── Both checks passed ─────────────────────────────────────────────────────
  return {
    ...base,
    result:          'VALID',
    message:         'Certificate is authentic and unmodified (verified offline)',
    hashStatus,
    signatureStatus,
    certificate: certDetails,
  };
}
