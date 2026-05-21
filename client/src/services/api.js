const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const getToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ?? null;
  } catch {
    return null;
  }
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    throw err;
  }

  return data;
};

export const api = {
  get: (endpoint, options) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  delete: (endpoint, options) =>
    request(endpoint, { ...options, method: 'DELETE' }),
};
