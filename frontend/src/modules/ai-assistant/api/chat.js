/**
 * chat.js
 * API client functions for AI Chat Assistant.
 */

import client from '../../../shared/api/client';

export const sendChatMessage = (data) => client.post('/chat/message', data);
export const getChatHistory   = (params) => client.get('/chat/history', { params });
export const clearChatHistory = (params) => client.delete('/chat/history', { params });
