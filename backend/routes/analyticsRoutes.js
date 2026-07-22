/**
 * analyticsRoutes.js
 * All routes require a valid JWT. Role enforcement is inside each controller.
 */

const express = require('express');
const router  = express.Router();
const { authenticateToken }                                          = require('../middleware/auth');
const { getUniversityAnalytics, getVerificationAnalytics, getStudentAnalytics } = require('../controllers/analyticsController');

router.get('/analytics/university',   authenticateToken, getUniversityAnalytics);
router.get('/analytics/verification', authenticateToken, getVerificationAnalytics);
router.get('/analytics/student',      authenticateToken, getStudentAnalytics);

module.exports = router;
