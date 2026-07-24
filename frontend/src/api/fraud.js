/**
 * fraud.js
 * API client functions for AI Fraud Analysis module.
 */

import client from './client';

export const runFraudAnalysis = (data) => client.post('/fraud-analysis/run', data);
export const getFraudAnalysis = (certId) => client.get(`/fraud-analysis/${certId}`);
export const getFraudHistory  = (params) => client.get('/fraud-analysis/history', { params });
