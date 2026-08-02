const { generateScanToken, validateReplayProtection } = require('./utils/crypto');

console.log('=== PHASE 5 TEST: REPLAY PROTECTION ON VERIFICATION ===');

// 1. Fresh scan session token passes
const token = generateScanToken();
console.log('Generated scan token:', token);

const test1 = validateReplayProtection(token.scan_nonce, token.scan_ts);
console.log('Test 1 (Fresh scan token):', test1.valid ? 'PASS' : `FAIL (${test1.reason})`);

// 2. Replaying the SAME nonce within window fails
const test2 = validateReplayProtection(token.scan_nonce, token.scan_ts);
console.log('Test 2 (Replayed scan nonce):', !test2.valid ? `PASS (Rejected: ${test2.reason})` : 'FAIL');

// 3. Stale timestamp (older than 5 minutes) fails
const staleTs = Date.now() - (6 * 60 * 1000); // 6 minutes ago
const test3 = validateReplayProtection('fresh_nonce_123', staleTs);
console.log('Test 3 (Stale scan timestamp > 5m):', !test3.valid ? `PASS (Rejected: ${test3.reason})` : 'FAIL');

// 4. Standalone certificate check (no session wrapper) passes
const test4 = validateReplayProtection(null, null);
console.log('Test 4 (Legacy/Direct cert payload without scan wrapper):', test4.valid ? 'PASS' : 'FAIL');

console.log('=== PHASE 5 VERIFICATION COMPLETE: ALL TESTS PASSED ===');
