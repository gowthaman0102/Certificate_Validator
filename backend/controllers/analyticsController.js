/**
 * analyticsController.js
 * Provides read-only analytics derived from the existing SQLite tables.
 * Never modifies any existing table or controller.
 *
 * Routes:
 *   GET /api/analytics/university   — UNIVERSITY role
 *   GET /api/analytics/verification — UNIVERSITY role
 *   GET /api/analytics/student      — STUDENT role
 */

const { db } = require('../config/db');

// ─── helpers ─────────────────────────────────────────────────────────────────

function twelveMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 11);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── GET /api/analytics/university ───────────────────────────────────────────

function getUniversityAnalytics(req, res) {
  try {
    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Access restricted to university accounts' });
    }

    const university = db.prepare('SELECT * FROM universities WHERE user_id = ?').get(req.user.id);
    if (!university) {
      return res.status(404).json({ error: 'University profile not found' });
    }

    const uid       = university.id;
    const dateFrom  = req.query.date_from || twelveMonthsAgo();
    const dateTo    = req.query.date_to   || today();

    // ── Summary ──────────────────────────────────────────────────────────────
    const summary = db.prepare(`
      SELECT
        COUNT(*)                                              AS total,
        SUM(CASE WHEN status = 'VALID'   THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'REVOKED' THEN 1 ELSE 0 END) AS revoked,
        COUNT(DISTINCT register_number)                       AS students,
        COUNT(DISTINCT course)                                AS departments
      FROM certificates
      WHERE university_id = ?
    `).get(uid);

    // ── Monthly issuance (filtered date range) ───────────────────────────────
    const monthly = db.prepare(`
      SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
      FROM certificates
      WHERE university_id = ?
        AND date(created_at) >= date(?)
        AND date(created_at) <= date(?)
      GROUP BY month
      ORDER BY month ASC
    `).all(uid, dateFrom, dateTo);

    // ── Top 10 departments (course) ──────────────────────────────────────────
    const departments = db.prepare(`
      SELECT course, COUNT(*) AS count
      FROM certificates
      WHERE university_id = ?
      GROUP BY course
      ORDER BY count DESC
      LIMIT 10
    `).all(uid);

    // ── Recent certificates (last 10) ────────────────────────────────────────
    const recent = db.prepare(`
      SELECT id, certificate_number, student_name, course, status, created_at
      FROM certificates
      WHERE university_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(uid);

    // ── Revocation history ───────────────────────────────────────────────────
    const revocations = db.prepare(`
      SELECT r.revoked_at, r.reason, c.student_name, c.course, c.certificate_number
      FROM revoked_certificates r
      JOIN certificates c ON r.certificate_id = c.id
      WHERE c.university_id = ?
      ORDER BY r.revoked_at DESC
      LIMIT 10
    `).all(uid);

    res.json({ summary, monthly, departments, recent, revocations, university: { name: university.name, issuer_code: university.issuer_code } });
  } catch (err) {
    console.error('[analyticsController] university:', err);
    res.status(500).json({ error: 'Failed to fetch university analytics' });
  }
}

// ─── GET /api/analytics/verification ─────────────────────────────────────────

function getVerificationAnalytics(req, res) {
  try {
    if (req.user.role !== 'UNIVERSITY') {
      return res.status(403).json({ error: 'Access restricted to university accounts' });
    }

    // ── Overall verification counts ──────────────────────────────────────────
    const summary = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN details LIKE '%"result":"VALID"%'    THEN 1 ELSE 0 END) AS valid_count,
        SUM(CASE WHEN details LIKE '%"result":"TAMPERED"%' THEN 1 ELSE 0 END) AS tampered_count,
        SUM(CASE WHEN details LIKE '%"result":"REVOKED"%'  THEN 1 ELSE 0 END) AS revoked_count,
        SUM(CASE WHEN status  = 'FAILURE'                  THEN 1 ELSE 0 END) AS failure_count
      FROM audit_logs
      WHERE module = 'VERIFICATION'
    `).get();

    // ── Monthly trend (last 12 months) ───────────────────────────────────────
    const monthly = db.prepare(`
      SELECT
        strftime('%Y-%m', timestamp) AS month,
        COUNT(*) AS total,
        SUM(CASE WHEN details LIKE '%"result":"VALID"%'    THEN 1 ELSE 0 END) AS valid_count,
        SUM(CASE WHEN details LIKE '%"result":"TAMPERED"%' THEN 1 ELSE 0 END) AS tampered_count,
        SUM(CASE WHEN details LIKE '%"result":"REVOKED"%'  THEN 1 ELSE 0 END) AS revoked_count
      FROM audit_logs
      WHERE module = 'VERIFICATION'
        AND date(timestamp) >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `).all();

    // ── Recent verifications (last 20 entries) ───────────────────────────────
    const recent = db.prepare(`
      SELECT timestamp, user_email, status, details, resource_id, ip_address
      FROM audit_logs
      WHERE module = 'VERIFICATION'
      ORDER BY timestamp DESC
      LIMIT 20
    `).all();

    // ── Auth activity summary ────────────────────────────────────────────────
    const authSummary = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN action = 'LOGIN'    AND status = 'SUCCESS' THEN 1 ELSE 0 END) AS login_success,
        SUM(CASE WHEN action = 'LOGIN'    AND status = 'FAILURE' THEN 1 ELSE 0 END) AS login_failure,
        SUM(CASE WHEN action = 'REGISTER'                        THEN 1 ELSE 0 END) AS registrations
      FROM audit_logs
      WHERE module = 'AUTH'
    `).get();

    res.json({ summary, monthly, recent, authSummary });
  } catch (err) {
    console.error('[analyticsController] verification:', err);
    res.status(500).json({ error: 'Failed to fetch verification analytics' });
  }
}

// ─── GET /api/analytics/student ──────────────────────────────────────────────

function getStudentAnalytics(req, res) {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Access restricted to student accounts' });
    }

    const email  = req.user.email || '';
    const regNum = req.user.register_number || '';

    // ── Summary ──────────────────────────────────────────────────────────────
    const summary = db.prepare(`
      SELECT
        COUNT(*)                                              AS total,
        SUM(CASE WHEN status = 'VALID'   THEN 1 ELSE 0 END) AS valid_count,
        SUM(CASE WHEN status = 'REVOKED' THEN 1 ELSE 0 END) AS revoked_count,
        COUNT(DISTINCT university_id)                         AS universities
      FROM certificates
      WHERE student_email = ? OR register_number = ?
    `).get(email, regNum);

    // ── Certificate list with university names ───────────────────────────────
    const certificates = db.prepare(`
      SELECT c.id, c.certificate_number, c.student_name, c.course,
             c.issue_date, c.status, c.created_at,
             u.name AS university_name
      FROM certificates c
      JOIN universities u ON c.university_id = u.id
      WHERE c.student_email = ? OR c.register_number = ?
      ORDER BY c.created_at DESC
    `).all(email, regNum);

    // ── Monthly receive timeline ─────────────────────────────────────────────
    const timeline = db.prepare(`
      SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
      FROM certificates
      WHERE (student_email = ? OR register_number = ?)
        AND date(created_at) >= date('now', '-24 months')
      GROUP BY month
      ORDER BY month ASC
    `).all(email, regNum);

    // ── Wallet events (downloads / shares) ───────────────────────────────────
    const walletStats = db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'DOWNLOAD' THEN 1 ELSE 0 END) AS downloads,
        SUM(CASE WHEN event_type = 'SHARE'    THEN 1 ELSE 0 END) AS shares,
        SUM(CASE WHEN event_type = 'VERIFY'   THEN 1 ELSE 0 END) AS verifications
      FROM wallet_events
      WHERE student_user_id = ?
    `).get(req.user.id);

    res.json({ summary, certificates, timeline, walletStats: walletStats || { downloads: 0, shares: 0, verifications: 0 } });
  } catch (err) {
    console.error('[analyticsController] student:', err);
    res.status(500).json({ error: 'Failed to fetch student analytics' });
  }
}

module.exports = { getUniversityAnalytics, getVerificationAnalytics, getStudentAnalytics };
