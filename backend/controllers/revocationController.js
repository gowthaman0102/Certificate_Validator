const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');

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

    const cert = db.prepare('SELECT * FROM certificates WHERE id = ?').get(certificate_id);
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (cert.university_id !== university.id) {
      return res.status(403).json({ error: 'You can only revoke certificates issued by your own university' });
    }

    if (cert.status === 'REVOKED') {
      return res.status(409).json({ error: 'Certificate is already revoked' });
    }

    const revocationId = uuidv4();

    db.prepare('UPDATE certificates SET status = ? WHERE id = ?').run('REVOKED', certificate_id);
    db.prepare('INSERT INTO revoked_certificates (id, certificate_id, reason) VALUES (?, ?, ?)')
      .run(revocationId, certificate_id, reason || 'No reason provided');

    res.json({ message: 'Certificate revoked successfully', certificate_id, status: 'REVOKED' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
}

function getRevokedList(req, res) {
  try {
    const revoked = db.prepare(`
      SELECT r.id, r.certificate_id, r.reason, r.revoked_at, c.student_name, c.course
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
