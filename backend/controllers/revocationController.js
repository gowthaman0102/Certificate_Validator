const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');
const { generateHash, signData } = require('../utils/crypto');
const { logAudit } = require('../utils/auditLogger');
const { anchorToBlockchain } = require('../utils/blockchain');

function revokeCertificate(req, res) {
  try {
    const { certificate_id, reason } = req.body;
    const userId = req.user.id;

    if (!certificate_id) {
      return res.status(400).json({ error: 'certificate_id is required' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(userId);
    if (!university) {
      return res.status(403).json({ error: 'Only a registered university can revoke certificates' });
    }

    const cert = db.prepare(`
      SELECT c.*, u.issuer_code, u.name as university_name
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ? OR c.certificate_number = ?
    `).get(certificate_id, certificate_id);

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (cert.university_id !== university.id) {
      return res.status(403).json({ error: 'You can only revoke certificates issued by your own university' });
    }

    const existingRevocation = db.prepare('SELECT * FROM revoked_certificates WHERE certificate_id = ?').get(cert.id);
    if (cert.status === 'REVOKED' || existingRevocation) {
      return res.status(409).json({ error: 'Certificate is already revoked', revocation: existingRevocation });
    }

    const revocationId = uuidv4();
    const revokedAt = new Date().toISOString();
    const revocationReason = reason || 'No reason provided';

    // ── Canonical Revocation Payload & RSA-2048 Signing ──
    const revocationPayload = JSON.stringify({
      certificate_id: cert.id,
      certificate_number: cert.certificate_number,
      reason: revocationReason,
      revoked_at: revokedAt,
      revoked_by: university.issuer_code,
    });

    const revHash = generateHash(revocationPayload);
    const signature = signData(revHash, university.private_key);

    // ── Blockchain Anchoring ──
    let bcAnchor = null;
    try {
      bcAnchor = anchorToBlockchain({
        certHash: revHash,
        certId: cert.id,
        certNumber: cert.certificate_number,
        issuerCode: university.issuer_code,
        universityName: university.name,
      });
    } catch (bcErr) {
      console.error('[blockchain] Revocation anchor error:', bcErr.message);
    }

    db.prepare('UPDATE certificates SET status = ? WHERE id = ?').run('REVOKED', cert.id);
    db.prepare(`
      INSERT INTO revoked_certificates
        (id, certificate_id, revoked_by, reason, revoked_at, signature, block_number, tx_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      revocationId,
      cert.id,
      university.id,
      revocationReason,
      revokedAt,
      signature,
      bcAnchor?.blockNumber || null,
      bcAnchor?.txId || null
    );

    logAudit(req, {
      module: 'REVOCATION', action: 'REVOKE', status: 'SUCCESS',
      resource_id: cert.certificate_number,
      details: { certificate_number: cert.certificate_number, student_name: cert.student_name, reason: revocationReason, signature, txId: bcAnchor?.txId },
    });

    res.json({
      message: 'Certificate revoked successfully',
      certificate_id: cert.id,
      status: 'REVOKED',
      revocation: {
        id: revocationId,
        certificate_id: cert.id,
        reason: revocationReason,
        revoked_at: revokedAt,
        signature,
        tx_id: bcAnchor?.txId || null,
        block_number: bcAnchor?.blockNumber || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
}

function getRevokedList(req, res) {
  try {
    const revoked = db.prepare(`
      SELECT r.id, r.certificate_id, r.reason, r.revoked_at, r.signature, r.tx_id, r.block_number, c.student_name, c.course, c.certificate_number
      FROM revoked_certificates r
      JOIN certificates c ON r.certificate_id = c.id
      ORDER BY r.revoked_at DESC
    `).all();

    res.json(revoked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch revoked list' });
  }
}

module.exports = { revokeCertificate, getRevokedList };
