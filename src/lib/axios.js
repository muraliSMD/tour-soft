import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Relative path for Next.js API Routes
});

// Add Authorization header if token exists
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
});

export default api;
