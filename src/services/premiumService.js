import { get, post } from './api.js';

// GET /api/premium/plans
export const getPlans = () => get('/api/premium/plans');

// GET /api/premium/status
export const getStatus = () => get('/api/premium/status');

// POST /api/premium/subscribe  { planId }
export const subscribe = (planId) => post('/api/premium/subscribe', { planId });
