/**
 * blockchain.js — Simulated Blockchain Service
 *
 * Architecture: append-only SQLite ledger that mirrors the interface a real
 * Ethereum / Polygon contract would expose.
 *
 * Migration path to mainnet:
 *   1. npm install ethers
 *   2. Replace the three SQLite functions below with ethers.js contract calls.
 *   3. Zero other files need to change.
 *
 * Ethereum tx-id format: 0x + 64-char hex (sha256 of hash + timestamp + nonce)
 * Block hash format:     0x + 64-char hex (sha256 of blockNumber + prevHash + certHash)
 */

const crypto = require('crypto');
const { db } = require('../config/db');

const GENESIS_HASH = '0x' + '0'.repeat(64); // genesis block has no predecessor
const NETWORK      = 'SIMULATED';            // swap to 'POLYGON_MAINNET' when live

// ─── Internal helpers ────────────────────────────────────────────────────────

function hex64(data) {
  return '0x' + crypto.createHash('sha256').update(String(data)).digest('hex');
}

function generateTxId(certHash, anchoredAt) {
  const nonce = crypto.randomBytes(8).toString('hex');
  return hex64(`${certHash}:${anchoredAt}:${nonce}`);
}

function getLatestAnchor() {
  return db.prepare(
    'SELECT block_number, block_hash FROM blockchain_anchors ORDER BY block_number DESC LIMIT 1'
  ).get() || null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Anchors a certificate hash on the simulated blockchain.
 * Called immediately after a certificate INSERT — non-blocking by convention
 * (caller should catch and log, not abort the certificate issuance).
 *
 * @returns {{ txId, blockNumber, blockHash, anchoredAt, network }}
 */
function anchorToBlockchain({ certHash, certId, certNumber, issuerCode, universityName }) {
  const anchoredAt    = new Date().toISOString();
  const latest        = getLatestAnchor();
  const prevBlockHash = latest ? latest.block_hash : GENESIS_HASH;
  const blockNumber   = latest ? latest.block_number + 1 : 1;
  const blockHash     = hex64(`${blockNumber}:${prevBlockHash}:${certHash}`);
  const txId          = generateTxId(certHash, anchoredAt);

  db.prepare(`
    INSERT INTO blockchain_anchors
      (tx_id, block_number, block_hash, prev_block_hash, cert_hash,
       cert_id, certificate_number, issuer_code, university_name, anchored_at, network, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
  `).run(txId, blockNumber, blockHash, prevBlockHash, certHash,
         certId, certNumber, issuerCode, universityName, anchoredAt, NETWORK);

  return { txId, blockNumber, blockHash, anchoredAt, network: NETWORK };
}

/**
 * Looks up a blockchain anchor by certificate hash.
 * @returns {Object|null}
 */
function verifyOnBlockchain(certHash) {
  return db.prepare(
    'SELECT * FROM blockchain_anchors WHERE cert_hash = ? LIMIT 1'
  ).get(certHash) || null;
}

/**
 * Returns the most recent anchors for the explorer.
 * @param {number} limit
 * @param {number} offset
 * @returns {Array}
 */
function getRecentAnchors(limit = 20, offset = 0) {
  return db.prepare(
    'SELECT * FROM blockchain_anchors ORDER BY block_number DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);
}

/**
 * Looks up a single anchor by its transaction ID.
 * @param {string} txId
 * @returns {Object|null}
 */
function getAnchorByTxId(txId) {
  return db.prepare(
    'SELECT * FROM blockchain_anchors WHERE tx_id = ? LIMIT 1'
  ).get(txId) || null;
}

/**
 * Searches anchors by certificate number, cert_id, or tx_id prefix.
 * @param {string} query
 * @returns {Array}
 */
function searchAnchors(query) {
  const q = `%${query}%`;
  return db.prepare(`
    SELECT * FROM blockchain_anchors
    WHERE tx_id LIKE ? OR certificate_number LIKE ? OR cert_hash LIKE ?
    ORDER BY block_number DESC
    LIMIT 50
  `).all(q, q, q);
}

/**
 * Returns network-level stats for the explorer header.
 * @returns {{ totalTransactions, latestBlock, network, genesisHash }}
 */
function getNetworkStats() {
  const row = db.prepare(
    'SELECT COUNT(*) as total, MAX(block_number) as latest FROM blockchain_anchors'
  ).get();
  return {
    totalTransactions: row.total || 0,
    latestBlock:       row.latest || 0,
    network:           NETWORK,
    genesisHash:       GENESIS_HASH,
  };
}

module.exports = {
  anchorToBlockchain,
  verifyOnBlockchain,
  getRecentAnchors,
  getAnchorByTxId,
  searchAnchors,
  getNetworkStats,
};
