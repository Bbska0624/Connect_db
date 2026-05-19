import { get, put } from './api.js';

// GET /api/schedule/me
export const getSchedule = () => get('/api/schedule/me');

// PUT /api/schedule/me  { cells: [{day, hour, type}] }
export const saveSchedule = async (cells) => {
  const res = await put('/api/schedule/me', { cells });
  if (res.success) {
    localStorage.setItem('nc_schedule', JSON.stringify(cells));
  }
  return res;
};

// Returns cached cells from localStorage without a network hop
export const getCachedCells = () => {
  try {
    const raw = localStorage.getItem('nc_schedule');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
