import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE_URL });

export const fetchBlockchainStats   = ()          => client.get('/blockchain/stats');
export const fetchRecentAnchors     = (page = 1, limit = 20) => client.get(`/blockchain/anchors?page=${page}&limit=${limit}`);
export const fetchAnchorByTxId      = (txId)      => client.get(`/blockchain/tx/${encodeURIComponent(txId)}`);
export const searchBlockchainAnchors = (q)        => client.get(`/blockchain/search?q=${encodeURIComponent(q)}`);
