import { get, post } from './api.js';

// GET /api/chat/threads
export const getThreads = () => get('/api/chat/threads');

// GET /api/chat/messages/:userId
export const getMessages = (userId) => get(`/api/chat/messages/${userId}`);

// POST /api/chat/messages/:userId  { text }
export const sendMessage = (userId, text) => post(`/api/chat/messages/${userId}`, { text });

// GET /api/chat/people
export const getPeople = () => get('/api/chat/people');

// GET /api/chat/general
export const getGeneralMessages = () => get('/api/chat/general');

// POST /api/chat/general  { text }
export const sendGeneralMessage = (text) => post('/api/chat/general', { text });
