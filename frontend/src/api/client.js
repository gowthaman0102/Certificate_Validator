import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const registerUser = (data) => client.post('/register', data);
export const loginUser = (data) => client.post('/login', data);

// ---- University ----
export const createUniversity = (data) => client.post('/university/create', data);
export const getMyUniversity = () => client.get('/university/me');
export const getUniversity = (id) => client.get(`/university/${id}`);

// ---- Certificates ----
export const uploadCertificate = (formData) =>
  client.post('/certificate/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const bulkUploadCertificates = (rows) => client.post('/certificate/bulk-upload', { rows });
export const getCertificate = (id) => client.get(`/certificate/${id}`);
export const getCertificateByCertNumber = (certNumber) => client.get(`/certificate/by-number/${certNumber}`);
export const getCertificatesByUniversity = (id) => client.get(`/certificates/university/${id}`);
export const getCertificatesByEmail = (email) => client.get(`/certificates/by-email?email=${encodeURIComponent(email)}`);
export const getCertificatesByRegisterNumber = (registerNumber) => client.get(`/certificates/by-register-number?registerNumber=${encodeURIComponent(registerNumber)}`);

// ---- Verification ----
export const verifyCertificate = (data) => client.post('/verify', data);
export const getPublicKey = (issuerId) => client.get(`/public-key/${issuerId}`);

// ---- Revocation ----
export const revokeCertificate = (data) => client.post('/certificate/revoke', data);
export const getRevokedList = () => client.get('/revoked/list');

export default client;
