const express = require('express');
const router = express.Router();
const { createUniversity, getUniversity, getMyUniversity } = require('../controllers/universityController');
const { authenticateToken } = require('../middleware/auth');

router.post('/university/create', authenticateToken, createUniversity);
router.get('/university/me', authenticateToken, getMyUniversity);
router.get('/university/:id', getUniversity);

module.exports = router;
