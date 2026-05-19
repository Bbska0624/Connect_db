const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path, options = {}) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
    });
    return res.json();
  } catch {
    return { success: false, message: 'Сүлжээний алдаа гарлаа. Сервер ажиллаж байгаа эсэхийг шалгана уу.', data: null };
  }
};

export const get  = (path)        => request(path, { method: 'GET' });
export const post = (path, body)  => request(path, { method: 'POST', body: JSON.stringify(body) });
export const put  = (path, body)  => request(path, { method: 'PUT',  body: JSON.stringify(body) });
