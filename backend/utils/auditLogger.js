/**
 * auditLogger.js
 * Fire-and-forget helper called from controllers.
 * A failure here NEVER propagates to the caller — it only logs to console.
 *
 * Usage:
 *   const { logAudit } = require('../utils/auditLogger');
 *   logAudit(req, {
 *     module: 'AUTH',
 *     action: 'LOGIN',
 *     status: 'SUCCESS',
 *     resource_id: user.id,
 *     details: { email: user.email }
 *   });
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');

const INSERT_SQL = `
  INSERT INTO audit_logs
    (id, timestamp, user_id, user_email, user_name, role, module, action, status, ip_address, details, resource_id)
  VALUES
    (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

/**
 * @param {import('express').Request|null} req  - Express request (for IP extraction). Pass null when no request context.
 * @param {object} opts
 * @param {string}  opts.module      - 'AUTH' | 'CERTIFICATE' | 'VERIFICATION' | 'REVOCATION' | 'WALLET'
 * @param {string}  opts.action      - 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'ISSUE' | 'BULK_ISSUE' | 'VERIFY' | 'REVOKE' | 'DOWNLOAD' | 'SHARE' | 'VIEW'
 * @param {string}  [opts.status]    - 'SUCCESS' | 'FAILURE'  (default 'SUCCESS')
 * @param {string}  [opts.user_id]
 * @param {string}  [opts.user_email]
 * @param {string}  [opts.user_name]
 * @param {string}  [opts.role]
 * @param {string}  [opts.resource_id]
 * @param {object}  [opts.details]   - extra context (will be JSON-stringified)
 */
function logAudit(req, opts) {
  try {
    const {
      module,
      action,
      status      = 'SUCCESS',
      user_id     = null,
      user_email  = null,
      user_name   = null,
      role        = null,
      resource_id = null,
      details     = null,
    } = opts;

    // Prefer req.user (JWT decoded) when available, fallback to PUBLIC_VERIFIER for verification actions
    const uid    = user_id    || req?.user?.id    || null;
    const email  = user_email || req?.user?.email  || (module === 'VERIFICATION' ? 'public@verifier' : null);
    const uname  = user_name  || req?.user?.name   || (module === 'VERIFICATION' ? 'Public Verifier' : null);
    const urole  = role       || req?.user?.role   || (module === 'VERIFICATION' ? 'PUBLIC_VERIFIER' : null);

    // Best-effort IP extraction with clean loopback normalization
    let rawIp = req
      ? (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || null)
      : null;
    let ip = rawIp;
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    } else if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }

    const detailsStr = details ? JSON.stringify(details) : null;

    db.prepare(INSERT_SQL).run(
      uuidv4(), uid, email, uname, urole,
      module, action, status, ip, detailsStr, resource_id
    );
  } catch (err) {
    // Logging must never crash the caller
    console.error('[audit] logAudit error:', err.message);
  }
}

module.exports = { logAudit };
