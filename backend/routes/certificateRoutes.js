const express = require('express');
const router = express.Router();
const { uploadCertificate, getCertificate, getCertificateByCertNumber, getCertificatesByUniversity, getCertificatesByEmail, getCertificatesByRegisterNumber, bulkUploadCertificates } = require('../controllers/certificateController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/certificate/upload', authenticateToken, upload.single('file'), uploadCertificate);
router.post('/certificate/bulk-upload', authenticateToken, bulkUploadCertificates);
router.get('/certificates/by-email', getCertificatesByEmail);
router.get('/certificates/by-register-number', getCertificatesByRegisterNumber);
router.get('/certificate/by-number/:certNumber', getCertificateByCertNumber);
router.get('/certificate/:id', getCertificate);
router.get('/certificates/university/:id', getCertificatesByUniversity);

module.exports = router;
