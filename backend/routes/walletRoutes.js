const express = require('express');
const router = express.Router();
const { recordWalletEvent, getWalletStats, getWalletHistory } = require('../controllers/walletController');
const { authenticateToken } = require('../middleware/auth');

// All wallet routes require a valid student JWT
router.post('/wallet/event', authenticateToken, recordWalletEvent);
router.get('/wallet/stats', authenticateToken, getWalletStats);
router.get('/wallet/history', authenticateToken, getWalletHistory);

module.exports = router;
