/**
 * disclosureRoutes.js
 * Router for Selective Disclosure endpoints
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createDisclosure, verifyDisclosure } = require('../controllers/disclosureController');

// Student-authenticated endpoint: generate a signed selective disclosure claim
router.post('/certificates/:id/disclosure', authenticateToken, createDisclosure);

// Public endpoint: independently verify a disclosure claim by disclosure ID
router.get('/disclosures/:disclosureId/verify', verifyDisclosure);

module.exports = router;
