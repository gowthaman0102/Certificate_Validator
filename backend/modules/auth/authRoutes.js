const express = require('express');
const router = express.Router();
const { register, login, logout } = require('./authController');
const { authRateLimiter } = require('../../core/middleware/rateLimiter');
const { authenticateToken } = require('../../core/middleware/auth');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);

module.exports = router;
