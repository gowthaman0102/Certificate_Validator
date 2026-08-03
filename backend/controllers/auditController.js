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

    const totalsRaw = db.prepare(`
      SELECT
        COUNT(*)                                                     AS total,
        COALESCE(SUM(CASE WHEN UPPER(status) = 'SUCCESS' THEN 1 ELSE 0 END), 0) AS success_count,
        COALESCE(SUM(CASE WHEN UPPER(status) = 'FAILURE' THEN 1 ELSE 0 END), 0) AS failure_count,
        COALESCE(SUM(CASE WHEN UPPER(module) = 'AUTH'    THEN 1 ELSE 0 END), 0) AS auth_events,
        COALESCE(SUM(CASE WHEN UPPER(module) = 'CERTIFICATE' THEN 1 ELSE 0 END), 0) AS cert_events,
        COALESCE(SUM(CASE WHEN UPPER(module) = 'VERIFICATION' THEN 1 ELSE 0 END), 0) AS verify_events,
        COALESCE(SUM(CASE WHEN UPPER(module) = 'REVOCATION'   THEN 1 ELSE 0 END), 0) AS revoke_events
      FROM audit_logs
    `).get();

    const totals = {
      total: totalsRaw?.total || 0,
      success_count: totalsRaw?.success_count || 0,
      failure_count: totalsRaw?.failure_count || 0,
      auth_events: totalsRaw?.auth_events || 0,
      cert_events: totalsRaw?.cert_events || 0,
      verify_events: totalsRaw?.verify_events || 0,
      revoke_events: totalsRaw?.revoke_events || 0,
    };

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

    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };

    const row = (cols, obj) => cols.map((h) => escape(obj[h])).join(',');

    // ── Section 1: Audit Log Events ──────────────────────────────────────────
    const { where, params } = buildWhere(req.query);
    const auditRows = db.prepare(
      `SELECT * FROM audit_logs ${where} ORDER BY timestamp DESC LIMIT 5000`
    ).all(...params);

    const auditHeader = ['id','timestamp','user_email','user_name','role','module','action','status','ip_address','resource_id','details'];
    const auditSection = [
      '# SECTION 1: AUDIT LOG EVENTS',
      auditHeader.join(','),
      ...auditRows.map((r) => row(auditHeader, r)),
    ];

    // ── Section 2: Revocation Events ─────────────────────────────────────────
    const revocationRows = db.prepare(`
      SELECT
        r.id, r.revoked_at AS timestamp, r.certificate_id, r.reason,
        r.signature, r.tx_id AS blockchain_tx_id, r.block_number,
        c.certificate_number, c.student_name, c.course,
        u.name AS issuing_university, u.issuer_code
      FROM revoked_certificates r
      LEFT JOIN certificates c ON c.id = r.certificate_id
      LEFT JOIN universities u ON u.id = r.revoked_by
      ORDER BY r.revoked_at DESC
    `).all();

    const revHeader = ['id','timestamp','certificate_number','student_name','course','reason','issuing_university','issuer_code','blockchain_tx_id','block_number','certificate_id','signature'];
    const revSection = [
      '',
      '# SECTION 2: REVOCATION EVENTS',
      revHeader.join(','),
      ...revocationRows.map((r) => row(revHeader, r)),
    ];

    // ── Section 3: Verification Activity Events ───────────────────────────────
    const verifRows = db.prepare(`
      SELECT
        ve.id, ve.verified_at AS timestamp, ve.certificate_number,
        ve.student_name, ve.verifier_org, ve.verification_result,
        u.name AS issuing_university
      FROM verification_events ve
      LEFT JOIN universities u ON u.id = ve.university_id
      ORDER BY ve.verified_at DESC
      LIMIT 5000
    `).all();

    const verifHeader = ['id','timestamp','certificate_number','student_name','verifier_org','verification_result','issuing_university'];
    const verifSection = [
      '',
      '# SECTION 3: VERIFICATION ACTIVITY EVENTS',
      verifHeader.join(','),
      ...verifRows.map((r) => row(verifHeader, r)),
    ];

    const ts = new Date().toISOString().slice(0, 10);
    const allLines = [...auditSection, ...revSection, ...verifSection];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="institutional_audit_report_${ts}.csv"`);
    res.send(allLines.join('\r\n'));
  } catch (err) {
    console.error('[auditController] exportCSV:', err);
    res.status(500).json({ error: 'Failed to export audit report' });
  }
}

module.exports = { getLogs, getStats, exportCSV };
