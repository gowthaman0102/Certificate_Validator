import axios from 'axios';
import { API_BASE_URL } from '../../app/config';

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
export const getCertificateByCertNumber = (certNumber) => {
  const clean = (certNumber || '').replace(/\\/g, '').trim();
  return client.get(`/certificate/by-number/${encodeURIComponent(clean)}`);
};
export const getCertificatesByUniversity = (id) => client.get(`/certificates/university/${id}`);
export const getCertificatesByEmail = (email) => client.get(`/certificates/by-email?email=${encodeURIComponent(email)}`);
export const getCertificatesByRegisterNumber = (registerNumber) => client.get(`/certificates/by-register-number?registerNumber=${encodeURIComponent(registerNumber)}`);
export const getStudentCertificates = ({ email, registerNumber }) => {
  const params = new URLSearchParams();
  if (email) params.set('email', email);
  if (registerNumber) params.set('registerNumber', registerNumber);
  return client.get(`/certificates/by-identity?${params.toString()}`);
};


// ---- Verification ----
export const verifyCertificate = (data) => client.post('/verify', data);
export const getPublicKey = (issuerId) => client.get(`/public-key/${issuerId}`);
export const getUniversityVerifications = () => client.get('/university/verifications');

// ---- Revocation ----
export const revokeCertificate = (id, reason) => client.post(`/certificate/${id}/revoke`, { reason });
export const getRevocationStatus = (id) => client.get(`/certificate/${id}/revocation-status`);
export const getRevokedList = () => client.get('/revoked/list');

export default client;
