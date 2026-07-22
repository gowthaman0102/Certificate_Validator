/**
 * api/audit.js
 * Axios helpers for the audit log endpoints.
 * Separate from client.js — never modifies existing API functions.
 */

import axios from 'axios';

const BASE = 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

/** Fetch paginated + filtered audit logs */
export function fetchAuditLogs(params = {}) {
  return axios.get(`${BASE}/audit/logs`, {
    headers: authHeaders(),
    params,
  });
}

/** Fetch aggregate stats for the summary bar */
export function fetchAuditStats() {
  return axios.get(`${BASE}/audit/stats`, {
    headers: authHeaders(),
  });
}

/**
 * Trigger a CSV download via a hidden <a> tag.
 * params should be the same filter object used for fetchAuditLogs.
 */
export function downloadAuditCSV(params = {}) {
  const token = localStorage.getItem('token');
  const qs    = new URLSearchParams({ ...params, token }).toString();
  const url   = `${BASE}/audit/export?${qs}`;

  // The server sets Content-Disposition: attachment — browser downloads automatically
  const a = document.createElement('a');
  a.href  = url;
  a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
