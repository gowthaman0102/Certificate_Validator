/**
 * walletStore.js
 * LocalStorage-backed store for wallet activity history.
 * Tracks VIEW, DOWNLOAD, SHARE, and VERIFY events per certificate.
 * All data is local to the device — no PII sent to server from this module.
 */

const HISTORY_KEY = 'cv_wallet_history';
const MAX_EVENTS = 500;

/**
 * Generate a lightweight unique ID for events.
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Read the full history array from localStorage.
 * @returns {Array} array of event objects, newest first
 */
export function getHistory(certId = null) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (certId) return all.filter((e) => e.certId === certId);
    return all;
  } catch {
    return [];
  }
}

/**
 * Append a new event to the history.
 * @param {'VIEW'|'DOWNLOAD'|'SHARE'|'VERIFY'} type
 * @param {string} certId  - certificate DB id
 * @param {Object} metadata - optional extra info (e.g. { certNumber, studentName })
 * @returns {Object} the created event
 */
export function recordEvent(type, certId, metadata = {}) {
  const history = getHistory();
  const event = {
    id: generateId(),
    type,
    certId,
    metadata,
    timestamp: new Date().toISOString(),
  };
  history.unshift(event);
  if (history.length > MAX_EVENTS) history.splice(MAX_EVENTS);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Quota exceeded — silently fail, wallet still works
  }
  return event;
}

/**
 * Compute aggregate stat counts across all events.
 * @returns {{ downloads: number, shares: number, verifications: number, views: number }}
 */
export function getStats() {
  const history = getHistory();
  return {
    downloads: history.filter((e) => e.type === 'DOWNLOAD').length,
    shares: history.filter((e) => e.type === 'SHARE').length,
    verifications: history.filter((e) => e.type === 'VERIFY').length,
    views: history.filter((e) => e.type === 'VIEW').length,
  };
}

/**
 * Compute stat counts for a specific certificate.
 * @param {string} certId
 */
export function getCertStats(certId) {
  const history = getHistory(certId);
  return {
    downloads: history.filter((e) => e.type === 'DOWNLOAD').length,
    shares: history.filter((e) => e.type === 'SHARE').length,
    verifications: history.filter((e) => e.type === 'VERIFY').length,
    views: history.filter((e) => e.type === 'VIEW').length,
  };
}

/**
 * Wipe all local wallet history.
 */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
