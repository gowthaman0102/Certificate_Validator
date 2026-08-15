/**
 * chatAssistantController.js
 * Controller for AI Chat Assistant endpoints.
 * Never modifies any existing endpoints or authentication middleware.
 */

const { processMessage, fetchHistory, purgeHistory } = require('./chatAssistantService');
const { logAudit } = require('../../core/utils/auditLogger');

/**
 * POST /api/chat/message
 * Process a user chat message and return AI assistant response.
 */
async function sendMessage(req, res) {
  try {
    const responseData = await processMessage(req, req.body || {});
    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    console.error('[chatAssistantController] Error handling message:', err);
    return res.status(500).json({
      error: 'Failed to process chat message.',
      details: err.message,
    });
  }
}

/**
 * GET /api/chat/history
 * Retrieve session or user chat history.
 */
async function getHistory(req, res) {
  try {
    const session_id = req.query.session_id;
    const user_id = req.query.user_id;

    const history = fetchHistory(req, { session_id, user_id });
    return res.status(200).json({
      success: true,
      history,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve chat history.',
      details: err.message,
    });
  }
}

/**
 * DELETE /api/chat/history
 * Clear chat history for a session or user.
 */
async function clearHistory(req, res) {
  try {
    const session_id = req.query.session_id || req.body?.session_id;
    const user_id = req.query.user_id || req.body?.user_id;

    const deletedCount = purgeHistory(req, { session_id, user_id });
    return res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully.',
      deletedCount,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to clear chat history.',
      details: err.message,
    });
  }
}

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
};
