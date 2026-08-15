const express = require('express');
const router = express.Router();
const { networkStats, recentAnchors, anchorByTxId, search } = require('./blockchainController');

// Public — no auth middleware
router.get('/blockchain/stats',          networkStats);
router.get('/blockchain/anchors',        recentAnchors);
router.get('/blockchain/tx/:txId',       anchorByTxId);
router.get('/blockchain/search',         search);

module.exports = router;
