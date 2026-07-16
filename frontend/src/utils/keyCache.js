const CACHE_PREFIX = 'pubkey_';

export function getCachedPublicKey(issuerId) {
  const cached = localStorage.getItem(CACHE_PREFIX + issuerId);
  return cached ? JSON.parse(cached) : null;
}

export function setCachedPublicKey(issuerId, universityName, publicKeyPem) {
  localStorage.setItem(
    CACHE_PREFIX + issuerId,
    JSON.stringify({ name: universityName, public_key: publicKeyPem, cached_at: new Date().toISOString() })
  );
}

export function listCachedIssuers() {
  const issuers = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(CACHE_PREFIX)) {
      const issuerId = key.replace(CACHE_PREFIX, '');
      const data = JSON.parse(localStorage.getItem(key));
      issuers.push({ issuerId, ...data });
    }
  }
  return issuers;
}
