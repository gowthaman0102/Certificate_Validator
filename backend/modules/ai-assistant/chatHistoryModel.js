/**
 * chatHistoryModel.js
 * SQLite model for managing chat_history records.
 * Never touches any existing application table.
 */

const { v4: uuidv4 } = require('uuid');
const { db } = require('../../core/config/db');

/**
 * Save a new user query & AI response entry into chat_history table.
 * @param {object} param0
 * @param {string} [param0.user_id]
 * @param {string} param0.role - 'STUDENT' | 'UNIVERSITY' | 'PUBLIC' | 'EMPLOYER'
 * @param {string} param0.message - User prompt
 * @param {string} param0.response - AI response text
 * @param {string} param0.session_id - Chat session identifier
 * @returns {string} ID of saved record
 */
function saveChatMessage({ user_id = null, role = 'PUBLIC', message, response, session_id }) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO chat_history (id, user_id, role, message, response, session_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(id, user_id, role, message, response, session_id);
  return id;
}

/**
 * Retrieve chat history for a session or user.
 * @param {object} param0
 * @param {string} [param0.session_id]
 * @param {string} [param0.user_id]
 * @param {number} [param0.limit]
 * @returns {object[]}
 */
function getChatHistory({ session_id, user_id, limit = 50 }) {
  if (session_id) {
    return db.prepare(`
      SELECT * FROM chat_history
      WHERE session_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `).all(session_id, limit);
  }
  if (user_id) {
    return db.prepare(`
      SELECT * FROM chat_history
      WHERE user_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `).all(user_id, limit);
  }
  return [];
}

/**
 * Clear chat history for a specific session or user.
 * @param {object} param0
 * @param {string} [param0.session_id]
 * @param {string} [param0.user_id]
 * @returns {number} Number of deleted rows
 */
function clearChatHistory({ session_id, user_id }) {
  if (session_id) {
    const info = db.prepare('DELETE FROM chat_history WHERE session_id = ?').run(session_id);
    return info.changes;
  }
  if (user_id) {
    const info = db.prepare('DELETE FROM chat_history WHERE user_id = ?').run(user_id);
    return info.changes;
  }
  return 0;
}

module.exports = {
  saveChatMessage,
  getChatHistory,
  clearChatHistory,
};
