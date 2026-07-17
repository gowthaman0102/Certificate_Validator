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

function normalizeValue(value) {
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

function buildNormalizedPayload(payload) {
  const normalized = {
    id: normalizeValue(payload.id ?? payload.cert_id),
    certificate_number: normalizeValue(payload.certificate_number),
    register_number: normalizeValue(payload.register_number),
    student_name: normalizeValue(payload.student_name),
    course: normalizeValue(payload.course),
    cgpa: normalizeValue(payload.cgpa),
    start_year: normalizeValue(payload.start_year),
    end_year: normalizeValue(payload.end_year),
    issue_date: normalizeValue(payload.issue_date),
    issuer_id: normalizeValue(payload.issuer_id),
  };
  return JSON.stringify(normalized);
}

export async function verifyOffline(qrPayload, publicKeyPem) {
  const { cert_id, certificate_number, register_number, student_name, course, cgpa, start_year, end_year, issue_date, issuer_id, hash, signature } = qrPayload;

  const recomputedPayload = buildNormalizedPayload({
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
  });

  const recomputedHash = await sha256Hex(recomputedPayload);

  if (recomputedHash !== hash) {
    return { result: 'TAMPERED', reason: 'Certificate data does not match its hash' };
  }

  let signatureValid;
  try {
    signatureValid = await verifyRsaSignature(hash, signature, publicKeyPem);
  } catch (err) {
    return { result: 'TAMPERED', reason: 'Signature verification failed - invalid signature or key format' };
  }

  if (!signatureValid) {
    return { result: 'TAMPERED', reason: 'Digital signature is invalid' };
  }

  return {
    result: 'VALID',
    message: 'Certificate is authentic and unmodified (verified offline)',
    certificate: { cert_id, certificate_number, register_number, student_name, course, cgpa, start_year, end_year, issue_date, issuer_id },
  };
}
