import { create } from 'zustand';
import api from '@/lib/axios';

const useAuthStore = create((set) => ({
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',

    register: async (userData) => {
        set({ isLoading: true, isError: false, message: '' });
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                set({ user: response.data, isSuccess: true, isLoading: false });
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    login: async (userData) => {
        set({ isLoading: true, isError: false, message: '' });
        try {
            const response = await api.post('/auth/login', userData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                set({ user: response.data, isSuccess: true, isLoading: false });
            }
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null });
    }
}));

export default useAuthStore;
