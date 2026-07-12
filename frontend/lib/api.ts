import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: false, // We're using Bearer tokens for now, not cookies
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`, {
              refreshToken,
            });
            localStorage.setItem('access_token', data.data.accessToken);
            api.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token failed, clear everything and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/';
          }
        } else {
          // No refresh token, redirect to login
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
