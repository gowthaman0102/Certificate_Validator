/**
 * fraudRoutes.js
 * Routes for AI Fraud Analysis module.
 * Registered under /api in server.js.
 */

const express = require('express');
const router = express.Router();
const {
  runAnalysis,
  getAnalysisByCertificate,
  getAnalysisHistory,
} = require('../controllers/fraudDetectionController');

router.post('/fraud-analysis/run', runAnalysis);
router.get('/fraud-analysis/history', getAnalysisHistory);
router.get('/fraud-analysis/:certificateId', getAnalysisByCertificate);

module.exports = router;
