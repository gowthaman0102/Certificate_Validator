const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');

/**
 * POST /api/wallet/event
 * Records a wallet event (VIEW, DOWNLOAD, SHARE, VERIFY) for the authenticated student.
 */
function recordWalletEvent(req, res) {
  try {
    const { certificate_id, event_type, metadata } = req.body;
    const studentUserId = req.user.id;

    if (!certificate_id || !event_type) {
      return res.status(400).json({ error: 'certificate_id and event_type are required' });
    }

    const validTypes = ['VIEW', 'DOWNLOAD', 'SHARE', 'VERIFY'];
    if (!validTypes.includes(event_type)) {
      return res.status(400).json({ error: `event_type must be one of: ${validTypes.join(', ')}` });
    }

    const eventId = uuidv4();
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    db.prepare(
      'INSERT INTO wallet_events (id, student_user_id, certificate_id, event_type, metadata, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(eventId, studentUserId, certificate_id, event_type, metadataStr);

    res.status(201).json({ message: 'Event recorded', id: eventId });
  } catch (err) {
    console.error('recordWalletEvent error:', err);
    res.status(500).json({ error: 'Failed to record wallet event' });
  }
}

/**
 * GET /api/wallet/stats
 * Returns aggregate event counts for the authenticated student.
 */
function getWalletStats(req, res) {
  try {
    const studentUserId = req.user.id;

    const rows = db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM wallet_events
      WHERE student_user_id = ?
      GROUP BY event_type
    `).all(studentUserId);

    const stats = { VIEW: 0, DOWNLOAD: 0, SHARE: 0, VERIFY: 0 };
    rows.forEach((r) => { stats[r.event_type] = r.count; });

    res.json(stats);
  } catch (err) {
    console.error('getWalletStats error:', err);
    res.status(500).json({ error: 'Failed to fetch wallet stats' });
  }
}

/**
 * GET /api/wallet/history?certificate_id=<optional>&limit=50&offset=0
 * Returns paginated event history for the authenticated student.
 */
function getWalletHistory(req, res) {
  try {
    const studentUserId = req.user.id;
    const { certificate_id, limit = 50, offset = 0 } = req.query;

    let query;
    let params;

    if (certificate_id) {
      query = `
        SELECT we.*, c.certificate_number, c.student_name, c.course
        FROM wallet_events we
        LEFT JOIN certificates c ON we.certificate_id = c.id
        WHERE we.student_user_id = ? AND we.certificate_id = ?
        ORDER BY we.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [studentUserId, certificate_id, Number(limit), Number(offset)];
    } else {
      query = `
        SELECT we.*, c.certificate_number, c.student_name, c.course
        FROM wallet_events we
        LEFT JOIN certificates c ON we.certificate_id = c.id
        WHERE we.student_user_id = ?
        ORDER BY we.created_at DESC
        LIMIT ? OFFSET ?
      `;
      params = [studentUserId, Number(limit), Number(offset)];
    }

    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (err) {
    console.error('getWalletHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch wallet history' });
  }
}

module.exports = { recordWalletEvent, getWalletStats, getWalletHistory };
