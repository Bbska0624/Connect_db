import { post } from './api.js';

// POST /api/auth/request-otp  { email }
export const requestOtp = async (email) => {
  const res = await post('/api/auth/request-otp', { email });
  if (res.success) {
    sessionStorage.setItem('otp_email', email);
  }
  return res;
};

// POST /api/auth/verify-otp  { email, code }
export const verifyOtp = async (email, code) => {
  const res = await post('/api/auth/verify-otp', { email, code });
  if (res.success && res.data?.token) {
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
  }
  return res;
};

// POST /api/auth/logout
export const logout = async () => {
  const res = await post('/api/auth/logout');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  sessionStorage.removeItem('otp_email');
  return res;
};

// Returns current session or null (no network call)
export const getSession = () => {
  const token = localStorage.getItem('auth_token');
  const raw   = localStorage.getItem('auth_user');
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
};
