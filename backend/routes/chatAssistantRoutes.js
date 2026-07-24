/**
 * chatAssistantRoutes.js
 * Routes for AI Chat Assistant module.
 * Registered under /api in server.js.
 */

const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatAssistantController');

router.post('/chat/message', sendMessage);
router.get('/chat/history', getHistory);
router.delete('/chat/history', clearHistory);

module.exports = router;
