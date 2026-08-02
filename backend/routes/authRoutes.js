const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

module.exports = router;
