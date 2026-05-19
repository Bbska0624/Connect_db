import { get, put } from './api.js';

// GET /api/profile/me
export const getProfile = () => get('/api/profile/me');

// PUT /api/profile/me  { ...fields }
export const updateProfile = (updates) => put('/api/profile/me', updates);
