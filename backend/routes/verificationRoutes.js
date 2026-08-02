const express = require('express');
const router = express.Router();
const { verifyCertificate, getPublicKey, getUniversityVerifications } = require('../controllers/verificationController');
const { authenticateToken } = require('../middleware/auth');
const { verifyRateLimiter } = require('../middleware/rateLimiter');

router.post('/verify', verifyRateLimiter, verifyCertificate);
router.get('/public-key/:issuer_id', getPublicKey);
router.get('/university/verifications', authenticateToken, getUniversityVerifications);

module.exports = router;
