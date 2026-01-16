import { create } from 'zustand';
import api from '@/lib/axios';

const useRegistrationStore = create((set) => ({
    registrations: [],
    activeRegistration: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',

    getMyRegistrations: async () => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get('/registrations');
            set({ registrations: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    getTournamentRegistrations: async (tournamentId) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get(`/registrations/tournament/${tournamentId}`);
            set({ registrations: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    registerTeam: async (tournamentId, teamData) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.post(`/registrations/tournament/${tournamentId}/register`, teamData);
            set((state) => ({
                registrations: [...state.registrations, response.data],
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    updateRegistration: async (id, data) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/registrations/${id}`, data);
            set((state) => ({
                registrations: state.registrations.map(r => r._id === id ? response.data : r),
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    approveRegistration: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/registrations/${id}/approve`);
            set((state) => ({
                registrations: state.registrations.map(r => r._id === id ? response.data : r),
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    rejectRegistration: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/registrations/${id}/reject`);
            set((state) => ({
                registrations: state.registrations.map(r => r._id === id ? response.data : r),
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    markAsPaid: async (id, notes) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/registrations/${id}/mark-paid`, { notes });
            set((state) => ({
                registrations: state.registrations.map(r => r._id === id ? response.data : r),
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    initiateOnlinePayment: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.post(`/registrations/${id}/payment/online`);
            set({ isLoading: false, isSuccess: true });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    deleteRegistration: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            await api.delete(`/registrations/${id}`);
            set((state) => ({
                registrations: state.registrations.filter(r => r._id !== id),
                isSuccess: true,
                isLoading: false
            }));
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    reset: () => {
        set({
            isError: false,
            isSuccess: false,
            isLoading: false,
            message: ''
        });
    }
}));

export default useRegistrationStore;
