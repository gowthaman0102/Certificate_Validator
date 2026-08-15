/**
 * chatAssistantService.js
 * Main service for processing AI Chat Assistant requests.
 * Orchestrates context building, prompt construction, LLM response generation, DB persistence, and audit logging.
 */

const { buildContext } = require('./contextBuilder');
const { buildSystemPrompt } = require('./promptBuilder');
const { generateResponse } = require('./llmProvider');
const { saveChatMessage, getChatHistory, clearChatHistory } = require('./chatHistoryModel');
const { logAudit } = require('../../core/utils/auditLogger');

/**
 * Handle user message submission.
 * @param {import('express').Request} req - Express request
 * @param {object} body
 * @param {string} body.message - User prompt text
 * @param {string} [body.session_id] - Session ID
 * @param {object} [body.context] - Client-provided contextual metadata
 * @returns {Promise<object>} Chat response payload
 */
async function processMessage(req, body) {
  const { message, session_id = 'default-session', context = {} } = body;

  if (!message || !message.trim()) {
    throw new Error('Message content is required.');
  }

  // Extract user info from req.user if authenticated token present
  const user = req.user || context.user || null;
  const userId = user?.id || null;
  const role = user?.role || context.role || 'PUBLIC';

  // 1. Build context
  const fullContext = buildContext({
    user,
    role,
    currentPage: context.currentPage,
    activeCert: context.activeCert,
    verificationResult: context.verificationResult,
    walletStats: context.walletStats,
  });

  // 2. Fetch past session messages for continuity
  const history = getChatHistory({ session_id, limit: 10 });

  // 3. Build system prompt
  const systemPrompt = buildSystemPrompt(fullContext);

  // 4. Generate AI response
  const aiResponseText = await generateResponse(systemPrompt, message, fullContext);

  // 5. Persist message to database
  const recordId = saveChatMessage({
    user_id: userId,
    role,
    message: message.trim(),
    response: aiResponseText,
    session_id,
  });

  // 6. Log audit event via existing auditLogger utility
  logAudit(req, {
    module: 'AI_CHAT',
    action: 'QUESTION_ASKED',
    status: 'SUCCESS',
    resource_id: recordId,
    details: {
      session_id,
      role,
      question: message.trim().substring(0, 100),
    },
  });

  return {
    id: recordId,
    session_id,
    role,
    userMessage: message.trim(),
    response: aiResponseText,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch session history.
 */
function fetchHistory(req, { session_id, user_id }) {
  const userId = user_id || req.user?.id || null;
  return getChatHistory({ session_id, user_id: userId });
}

/**
 * Clear session history.
 */
function purgeHistory(req, { session_id, user_id }) {
  const userId = user_id || req.user?.id || null;
  const count = clearChatHistory({ session_id, user_id: userId });

  logAudit(req, {
    module: 'AI_CHAT',
    action: 'CHAT_CLEARED',
    status: 'SUCCESS',
    details: { session_id, deleted_count: count },
  });

  return count;
}

module.exports = {
  processMessage,
  fetchHistory,
  purgeHistory,
};
