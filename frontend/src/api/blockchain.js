import axios from 'axios';
import { API_BASE_URL } from '../config';

const client = axios.create({ baseURL: API_BASE_URL });

export const fetchBlockchainStats   = ()          => client.get('/blockchain/stats');
export const fetchRecentAnchors     = (page = 1, limit = 20) => client.get(`/blockchain/anchors?page=${page}&limit=${limit}`);
export const fetchAnchorByTxId      = (txId)      => client.get(`/blockchain/tx/${encodeURIComponent(txId)}`);
export const searchBlockchainAnchors = (q)        => client.get(`/blockchain/search?q=${encodeURIComponent(q)}`);
