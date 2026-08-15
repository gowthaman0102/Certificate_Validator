/**
 * api/analytics.js
 * Axios helpers for the analytics endpoints.
 * Separate file — never modifies existing client.js.
 */

import axios from 'axios';
import { API_BASE_URL as BASE } from '../../app/config';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

/** University overview: summary, monthly issuance, dept breakdown, recent certs */
export function fetchUniversityAnalytics(params = {}) {
  return axios.get(`${BASE}/analytics/university`, {
    headers: authHeaders(),
    params,
  });
}

/** Verification trend data from audit_logs */
export function fetchVerificationAnalytics() {
  return axios.get(`${BASE}/analytics/verification`, {
    headers: authHeaders(),
  });
}

/** Student's own certificate stats and timeline */
export function fetchStudentAnalytics() {
  return axios.get(`${BASE}/analytics/student`, {
    headers: authHeaders(),
  });
}
