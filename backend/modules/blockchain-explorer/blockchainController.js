/**
 * blockchainController.js
 *
 * Public endpoints for the Blockchain Explorer.
 * No authentication required — mirrors Etherscan / PolygonScan behaviour.
 */

const {
  getRecentAnchors,
  getAnchorByTxId,
  searchAnchors,
  getNetworkStats,
} = require('../../core/utils/blockchain');

// GET /blockchain/stats
function networkStats(req, res) {
  try {
    res.json(getNetworkStats());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch network stats' });
  }
}

// GET /blockchain/anchors?page=1&limit=20
function recentAnchors(req, res) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const anchors = getRecentAnchors(limit, offset);
    res.json({ page, limit, anchors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch anchors' });
  }
}

// GET /blockchain/tx/:txId
function anchorByTxId(req, res) {
  try {
    const { txId } = req.params;
    const anchor = getAnchorByTxId(txId);
    if (!anchor) return res.status(404).json({ error: 'Transaction not found' });
    res.json(anchor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
}

// GET /blockchain/search?q=...
function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) return res.status(400).json({ error: 'Query must be at least 3 characters' });
    res.json(searchAnchors(q.trim()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
}

module.exports = { networkStats, recentAnchors, anchorByTxId, search };
