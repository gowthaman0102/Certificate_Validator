/**
 * api/wallet.js
 * Axios calls for the wallet backend endpoints.
 * Kept separate from api/client.js to avoid any risk of touching existing API contracts.
 */

import client from './client';

/**
 * Record a wallet event on the server (requires valid JWT in localStorage).
 * @param {'VIEW'|'DOWNLOAD'|'SHARE'|'VERIFY'} event_type
 * @param {string} certificate_id
 * @param {Object} [metadata]
 */
export const recordWalletEvent = (event_type, certificate_id, metadata = {}) =>
  client.post('/wallet/event', { event_type, certificate_id, metadata });

/**
 * Fetch server-side aggregate stats for the logged-in student.
 * Returns { VIEW, DOWNLOAD, SHARE, VERIFY } counts.
 */
export const fetchWalletStats = () => client.get('/wallet/stats');

/**
 * Fetch paginated wallet event history for the logged-in student.
 * @param {string} [certificate_id] - optional filter by cert
 * @param {number} [limit=50]
 * @param {number} [offset=0]
 */
export const fetchWalletHistory = (certificate_id = null, limit = 50, offset = 0) => {
  const params = { limit, offset };
  if (certificate_id) params.certificate_id = certificate_id;
  return client.get('/wallet/history', { params });
};
