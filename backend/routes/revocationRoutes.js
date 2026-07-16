const express = require('express');
const router = express.Router();
const { revokeCertificate, getRevokedList } = require('../controllers/revocationController');
const { authenticateToken } = require('../middleware/auth');

router.post('/certificate/revoke', authenticateToken, revokeCertificate);
router.get('/revoked/list', getRevokedList);

module.exports = router;
