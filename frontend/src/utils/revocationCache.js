const REVOKED_LIST_KEY = 'revoked_cert_ids';
const REVOKED_SYNC_KEY = 'revoked_last_synced';

export function cacheRevokedList(revokedArray) {
  const ids = revokedArray.map((r) => r.certificate_id);
  localStorage.setItem(REVOKED_LIST_KEY, JSON.stringify(ids));
  localStorage.setItem(REVOKED_SYNC_KEY, new Date().toISOString());
}

export function isCertRevokedLocally(certId) {
  const raw = localStorage.getItem(REVOKED_LIST_KEY);
  if (!raw) return null;
  const ids = JSON.parse(raw);
  return ids.includes(certId);
}

export function getLastSyncTime() {
  return localStorage.getItem(REVOKED_SYNC_KEY);
}
