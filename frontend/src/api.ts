import axios from 'axios';
import { useAppStore } from './store';

const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
    if (!url.endsWith('/')) url += '/';
    return url;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = useAppStore.getState().token;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors - auto logout on expired tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { token, logout } = useAppStore.getState();
            if (token) {
                logout();
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// Separate instance for public endpoints (no auth token)
export const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
});
