const express = require('express');
const router = express.Router();
const { revokeCertificate, getRevokedList } = require('./revocationController');
const { authenticateToken } = require('../../core/middleware/auth');

router.post('/certificate/revoke', authenticateToken, revokeCertificate);
router.get('/revoked/list', getRevokedList);

module.exports = router;
