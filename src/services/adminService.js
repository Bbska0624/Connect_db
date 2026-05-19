import { get, put } from './api.js';

// GET /api/admin/dashboard
export const getDashboard = () => get('/api/admin/dashboard');

// GET /api/admin/users?search=&filter=
export const getUsers = (search = '', filter = 'Бүгд') => {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (filter && filter !== 'Бүгд') params.set('filter', filter);
  const qs = params.toString();
  return get(`/api/admin/users${qs ? `?${qs}` : ''}`);
};

// PUT /api/admin/users/:id/block
export const blockUser = (id) => put(`/api/admin/users/${id}/block`);

// GET /api/admin/reports
export const getReports = () => get('/api/admin/reports');
