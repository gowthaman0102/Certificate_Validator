const express = require('express');
const router = express.Router();
const { verifyCertificate, getPublicKey, getUniversityVerifications } = require('./verificationController');
const { authenticateToken } = require('../../core/middleware/auth');
const { verifyRateLimiter } = require('../../core/middleware/rateLimiter');

router.post('/verify', verifyRateLimiter, verifyCertificate);
router.get('/public-key/:issuer_id', getPublicKey);
router.get('/university/verifications', authenticateToken, getUniversityVerifications);

module.exports = router;
