const express = require('express');
const router = express.Router();
const { uploadCertificate, getCertificate, getCertificateByCertNumber, getCertificatesByUniversity, getCertificatesByEmail, getCertificatesByRegisterNumber, getCertificatesByIdentity, bulkUploadCertificates, revokeCertificate, getRevocationStatus } = require('./certificateController');
const { authenticateToken } = require('../../core/middleware/auth');
const upload = require('../../core/middleware/upload');

router.post('/certificate/upload', authenticateToken, upload.single('file'), uploadCertificate);
router.post('/certificate/bulk-upload', authenticateToken, bulkUploadCertificates);
router.post('/certificate/:id/revoke', authenticateToken, revokeCertificate);
router.post('/certificates/:id/revoke', authenticateToken, revokeCertificate);
router.get('/certificate/:id/revocation-status', getRevocationStatus);
router.get('/certificates/:id/revocation-status', getRevocationStatus);

router.get('/certificates/by-email', authenticateToken, getCertificatesByEmail);
router.get('/certificates/by-register-number', authenticateToken, getCertificatesByRegisterNumber);
router.get('/certificates/by-identity', authenticateToken, getCertificatesByIdentity);
router.get('/certificate/by-number/:certNumber', getCertificateByCertNumber);
router.get('/certificate/:id', getCertificate);
router.get('/certificates/university/:id', authenticateToken, getCertificatesByUniversity);

module.exports = router;

