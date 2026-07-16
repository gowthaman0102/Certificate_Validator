const { db } = require('../config/db');
const { generateHash, verifySignature } = require('../utils/crypto');

function verifyCertificate(req, res) {
  try {
    const { cert_id, certificate_number, register_number, student_name, course, cgpa, start_year, end_year, issue_date, issuer_id, hash, signature } = req.body;
    if (!cert_id || !certificate_number || !register_number || !student_name || !course || !cgpa || !end_year || !issue_date || !issuer_id || !hash || !signature) {
      return res.status(400).json({ error: 'Incomplete QR data provided' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE issuer_code = ?').get(issuer_id);
    if (!university) {
      return res.json({ result: 'TAMPERED', reason: 'Unknown issuer — university not found' });
    }

    const recomputedPayload = JSON.stringify({
      id: cert_id,
      certificate_number,
      register_number,
      student_name,
      course,
      cgpa,
      start_year: start_year || '',
      end_year,
      issue_date,
      issuer_id
    });
    const recomputedHash = generateHash(recomputedPayload);
    if (recomputedHash !== hash) {
      return res.json({ result: 'TAMPERED', reason: 'Certificate data does not match its hash' });
    }

    const signatureValid = verifySignature(hash, signature, university.public_key);
    if (!signatureValid) {
      return res.json({ result: 'TAMPERED', reason: 'Digital signature is invalid' });
    }

    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(cert_id);
    if (cert && cert.status === 'REVOKED') {
      return res.json({ result: 'REVOKED', reason: 'This certificate has been revoked by the issuer' });
    }

    return res.json({
      result: 'VALID',
      message: 'Certificate is authentic and unmodified',
      certificate: { cert_id, certificate_number, register_number, student_name, course, cgpa, start_year, end_year, issue_date, issuer: university.name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

function getPublicKey(req, res) {
  try {
    const { issuer_id } = req.params;
    const university = db.prepare('SELECT name, issuer_code, public_key FROM universities WHERE issuer_code = ?').get(issuer_id);
    if (!university) {
      return res.status(404).json({ error: 'Issuer not found' });
    }
    res.json(university);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch public key' });
  }
}

module.exports = { verifyCertificate, getPublicKey };
