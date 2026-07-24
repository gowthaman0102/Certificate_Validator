/**
 * fraudDetectionController.js
 * Controller for AI Fraud Detection with Risk Scoring.
 * Never modifies any existing endpoints, databases, or authentication logic.
 * Integrates audit logging via existing auditLogger utility.
 */

const { analyzeCertificate } = require('../services/fraudDetectionService');
const { createFraudAnalysis, getLatestByCertificateId, getHistory, countHistory } = require('../models/fraudAnalysisModel');
const { logAudit } = require('../utils/auditLogger');

/**
 * POST /api/fraud-analysis/run
 * Execute AI Fraud Analysis for a certificate and store result.
 */
async function runAnalysis(req, res) {
  try {
    const { certificate_id, certificate_data, file_metadata } = req.body || {};

    if (!certificate_id && !certificate_data) {
      return res.status(400).json({ error: 'Either certificate_id or certificate_data payload is required for analysis.' });
    }

    // Log start event to existing audit log system
    logAudit(req, {
      module: 'FRAUD_ANALYSIS',
      action: 'FRAUD_ANALYSIS_STARTED',
      status: 'SUCCESS',
      resource_id: certificate_id || certificate_data?.cert_id || null,
      details: { certificate_number: certificate_data?.certificate_number }
    });

    // Run 8-layer AI analysis engine
    const analysisResult = await analyzeCertificate({
      certificate_id,
      certificate_data,
      file_metadata,
    });

    // Save result to new fraud_analysis table
    const analysisId = createFraudAnalysis({
      certificate_id: analysisResult.certificate_id,
      risk_score: analysisResult.risk_score,
      risk_level: analysisResult.risk_level,
      analysis_json: analysisResult,
      recommendation: analysisResult.recommendation,
    });

    // Log completion event to existing audit log system
    logAudit(req, {
      module: 'FRAUD_ANALYSIS',
      action: 'FRAUD_ANALYSIS_COMPLETED',
      status: 'SUCCESS',
      resource_id: analysisResult.certificate_id,
      details: {
        analysis_id: analysisId,
        risk_score: analysisResult.risk_score,
        risk_level: analysisResult.risk_level,
      }
    });

    return res.status(200).json({
      success: true,
      analysis_id: analysisId,
      ...analysisResult,
    });
  } catch (err) {
    console.error('[fraudDetectionController] Error during analysis:', err);
    logAudit(req, {
      module: 'FRAUD_ANALYSIS',
      action: 'FRAUD_ANALYSIS_COMPLETED',
      status: 'FAILURE',
      details: { error: err.message }
    });

    return res.status(500).json({
      error: 'AI Fraud Analysis failed to complete.',
      details: err.message,
    });
  }
}

/**
 * GET /api/fraud-analysis/:certificateId
 * Retrieve the latest fraud analysis for a specific certificate ID.
 */
async function getAnalysisByCertificate(req, res) {
  try {
    const { certificateId } = req.params;
    if (!certificateId) {
      return res.status(400).json({ error: 'Certificate ID is required.' });
    }

    const analysis = getLatestByCertificateId(certificateId);
    if (!analysis) {
      return res.status(404).json({ error: 'No fraud analysis found for this certificate ID.' });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve fraud analysis.', details: err.message });
  }
}

/**
 * GET /api/fraud-analysis/history
 * Retrieve overall fraud analysis history.
 */
async function getAnalysisHistory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const history = getHistory(limit, offset);
    const total = countHistory();

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      history,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve fraud analysis history.', details: err.message });
  }
}

module.exports = {
  runAnalysis,
  getAnalysisByCertificate,
  getAnalysisHistory,
};
