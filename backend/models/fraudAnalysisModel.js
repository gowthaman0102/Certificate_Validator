/**
 * fraudAnalysisModel.js
 * Thin SQLite wrapper for the fraud_analysis table.
 * Never touches any existing table.
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/db');

/**
 * Persist a completed fraud analysis result.
 * @param {object} data
 * @param {string} data.certificate_id
 * @param {number} data.risk_score        0-100
 * @param {string} data.risk_level        'VERY_SAFE'|'SAFE'|'MEDIUM_RISK'|'HIGH_RISK'|'VERY_HIGH_RISK'
 * @param {object} data.analysis_json     Full checks object (will be stringified)
 * @param {string} data.recommendation
 * @returns {string} New record id
 */
function createFraudAnalysis({ certificate_id, risk_score, risk_level, analysis_json, recommendation }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO fraud_analysis
      (id, certificate_id, risk_score, risk_level, analysis_json, recommendation, created_at)
    VALUES
      (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(id, certificate_id, risk_score, risk_level, JSON.stringify(analysis_json), recommendation);
  return id;
}

/**
 * Fetch the most recent fraud analysis for a given certificate.
 * @param {string} certificateId
 * @returns {object|null}
 */
function getLatestByCertificateId(certificateId) {
  const row = db.prepare(`
    SELECT * FROM fraud_analysis
    WHERE certificate_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(certificateId);

  if (!row) return null;
  return { ...row, analysis_json: JSON.parse(row.analysis_json) };
}

/**
 * Fetch all fraud analyses for a given certificate (full history).
 * @param {string} certificateId
 * @returns {object[]}
 */
function getAllByCertificateId(certificateId) {
  const rows = db.prepare(`
    SELECT * FROM fraud_analysis
    WHERE certificate_id = ?
    ORDER BY created_at DESC
  `).all(certificateId);

  return rows.map((r) => ({ ...r, analysis_json: JSON.parse(r.analysis_json) }));
}

/**
 * Fetch paginated history across all certificates.
 * @param {number} limit
 * @param {number} offset
 * @returns {object[]}
 */
function getHistory(limit = 50, offset = 0) {
  const rows = db.prepare(`
    SELECT fa.*, c.certificate_number, c.student_name
    FROM fraud_analysis fa
    LEFT JOIN certificates c ON fa.certificate_id = c.id
    ORDER BY fa.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  return rows.map((r) => ({ ...r, analysis_json: JSON.parse(r.analysis_json) }));
}

/**
 * Count total fraud analyses (for pagination).
 * @returns {number}
 */
function countHistory() {
  const row = db.prepare('SELECT COUNT(*) as total FROM fraud_analysis').get();
  return row ? row.total : 0;
}

module.exports = {
  createFraudAnalysis,
  getLatestByCertificateId,
  getAllByCertificateId,
  getHistory,
  countHistory,
};
