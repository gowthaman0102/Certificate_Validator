const express = require('express');
const router = express.Router();
const { register, login } = require('./authController');
const { authRateLimiter } = require('../../core/middleware/rateLimiter');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

module.exports = router;
