const REVOKED_LIST_KEY = 'revoked_cert_ids';
const REVOKED_SYNC_KEY = 'revoked_last_synced';

export function cacheRevokedList(revokedArray) {
  const ids = [];
  if (Array.isArray(revokedArray)) {
    for (const r of revokedArray) {
      if (r.certificate_id) ids.push(String(r.certificate_id).trim().toLowerCase());
      if (r.certificate_number) ids.push(String(r.certificate_number).trim().toLowerCase());
      if (r.id) ids.push(String(r.id).trim().toLowerCase());
    }
  }
  const uniqueIds = Array.from(new Set(ids));
  localStorage.setItem(REVOKED_LIST_KEY, JSON.stringify(uniqueIds));
  localStorage.setItem(REVOKED_SYNC_KEY, new Date().toISOString());
}

export function addRevokedToCache(...identifiers) {
  const raw = localStorage.getItem(REVOKED_LIST_KEY);
  let ids = [];
  if (raw) {
    try { ids = JSON.parse(raw); } catch {}
  }
  for (const id of identifiers) {
    if (id) ids.push(String(id).trim().toLowerCase());
  }
  const uniqueIds = Array.from(new Set(ids));
  localStorage.setItem(REVOKED_LIST_KEY, JSON.stringify(uniqueIds));
  localStorage.setItem(REVOKED_SYNC_KEY, new Date().toISOString());
}

export function isCertRevokedLocally(...identifiers) {
  const raw = localStorage.getItem(REVOKED_LIST_KEY);
  if (!raw) return false;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return false;
    const set = new Set(list.map(x => String(x).trim().toLowerCase()));
    for (const id of identifiers) {
      if (id && set.has(String(id).trim().toLowerCase())) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function getLastSyncTime() {
  return localStorage.getItem(REVOKED_SYNC_KEY);
}
