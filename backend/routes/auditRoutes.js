/**
 * auditRoutes.js
 * All routes require a valid JWT (authenticateToken).
 * Role enforcement is inside each controller handler.
 */

const express = require('express');
const router  = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getLogs, getStats, exportCSV } = require('../controllers/auditController');

router.get('/audit/logs',   authenticateToken, getLogs);
router.get('/audit/stats',  authenticateToken, getStats);
router.get('/audit/export', authenticateToken, exportCSV);

module.exports = router;
