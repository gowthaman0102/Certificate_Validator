const express = require('express');
const router = express.Router();
const { verifyCertificate, getPublicKey } = require('../controllers/verificationController');

router.post('/verify', verifyCertificate);
router.get('/public-key/:issuer_id', getPublicKey);

module.exports = router;
