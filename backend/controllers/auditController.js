/**
 * auditController.js
 * Read and export audit logs. UNIVERSITY-role only.
 *
 * Routes (all require authenticateToken):
 *   GET /api/audit/logs    — paginated, filterable list
 *   GET /api/audit/export  — CSV download of filtered results
 *   GET /api/audit/stats   — aggregate counts for the summary bar
 */

const { db } = require('../config/db');

// ─── Shared filter builder ───────────────────────────────────────────────────

function buildWhere(q) {
  const conditions = [];
  const params     = [];

  if (q.module) {
    conditions.push('module = ?');
    params.push(q.module.toUpperCase());
  }
  if (q.action) {
    conditions.push('action = ?');
    params.push(q.action.toUpperCase());
  }
  if (q.status) {
    conditions.push('status = ?');
    params.push(q.status.toUpperCase());
  }
  if (q.role) {
    conditions.push('role = ?');
    params.push(q.role.toUpperCase());
  }
  if (q.date_from) {
    conditions.push("date(timestamp) >= date(?)");
    params.push(q.date_from);
  }
  if (q.date_to) {
    conditions.push("date(timestamp) <= date(?)");
    params.push(q.date_to);
  }
  if (q.search) {
    const term = `%${q.search}%`;
    conditions.push('(user_email LIKE ? OR details LIKE ? OR user_name LIKE ? OR resource_id LIKE ?)');
    params.push(term, term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

// ─── GET /api/audit/logs ─────────────────────────────────────────────────────

function getLogs(req, res) {
  try {
    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Access restricted to university accounts' });
    }

    const page  = Math.max(1, parseInt(req.query.page  || '1',  10));
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit || '25', 10)));
    const offset = (page - 1) * limit;

    const { where, params } = buildWhere(req.query);

    const total = db.prepare(`SELECT COUNT(*) as cnt FROM audit_logs ${where}`)
      .get(...params).cnt;

    const rows = db.prepare(
      `SELECT * FROM audit_logs ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      rows,
    });
  } catch (err) {
    console.error('[auditController] getLogs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

// ─── GET /api/audit/stats ────────────────────────────────────────────────────

function getStats(req, res) {
  try {
    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Access restricted to university accounts' });
    }

    const totals = db.prepare(`
      SELECT
        COUNT(*)                                          AS total,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_count,
        SUM(CASE WHEN status = 'FAILURE' THEN 1 ELSE 0 END) AS failure_count,
        SUM(CASE WHEN module = 'AUTH'    THEN 1 ELSE 0 END) AS auth_events,
        SUM(CASE WHEN module = 'CERTIFICATE' THEN 1 ELSE 0 END) AS cert_events,
        SUM(CASE WHEN module = 'VERIFICATION' THEN 1 ELSE 0 END) AS verify_events,
        SUM(CASE WHEN module = 'REVOCATION'   THEN 1 ELSE 0 END) AS revoke_events
      FROM audit_logs
    `).get();

    res.json(totals);
  } catch (err) {
    console.error('[auditController] getStats:', err);
    res.status(500).json({ error: 'Failed to fetch audit stats' });
  }
}

// ─── GET /api/audit/export ───────────────────────────────────────────────────

function exportCSV(req, res) {
  try {
    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Access restricted to university accounts' });
    }

    const { where, params } = buildWhere(req.query);

    const rows = db.prepare(
      `SELECT * FROM audit_logs ${where} ORDER BY timestamp DESC LIMIT 5000`
    ).all(...params);

    const header = ['id','timestamp','user_email','user_name','role','module','action','status','ip_address','resource_id','details'];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };

    const lines = [
      header.join(','),
      ...rows.map((r) => header.map((h) => escape(r[h])).join(',')),
    ];

    const ts = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${ts}.csv"`);
    res.send(lines.join('\r\n'));
  } catch (err) {
    console.error('[auditController] exportCSV:', err);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
}

module.exports = { getLogs, getStats, exportCSV };
