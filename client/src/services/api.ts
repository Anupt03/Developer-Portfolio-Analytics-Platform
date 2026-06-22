import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

// Lazy getter to break circular dependency (store → authSlice → api → store)
const getStore = () => import('../store').then((m) => m.store);
const getAuthActions = () => import('../store/authSlice').then((m) => m);

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const { store } = await import('../store');
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { store } = await import('../store');
        const { setCredentials, clearCredentials } = await import('../store/authSlice');

        // Try to refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        const user = store.getState().auth.user;

        if (user && accessToken) {
          store.dispatch(setCredentials({ user, accessToken }));
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        const { store } = await import('../store');
        const { clearCredentials } = await import('../store/authSlice');
        // Refresh token failed or expired
        store.dispatch(clearCredentials());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

