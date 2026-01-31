import { create } from 'zustand';
import api from '@/lib/axios';

const useTournamentStore = create((set) => ({
    tournaments: [],
    activeTournament: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',

    createTournament: async (tournamentData) => {
        set({ isLoading: true, isError: false, message: '' });
        try {
            const response = await api.post('/tournaments', tournamentData);
            set((state) => ({
                tournaments: [...state.tournaments, response.data],
                isSuccess: true,
                isLoading: false
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    getTournaments: async () => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get('/tournaments');
            set({ tournaments: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    getTournament: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get(`/tournaments/${id}`);
            set({ activeTournament: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    updateTournament: async (id, data) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/tournaments/${id}`, data);
            set((state) => ({
                activeTournament: response.data,
                tournaments: state.tournaments.map(t => t._id === id ? response.data : t),
                isLoading: false,
                isSuccess: true
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    startTournament: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.post(`/tournaments/${id}/start`);
            set((state) => ({
                activeTournament: { ...state.activeTournament, status: 'Active' },
                tournaments: state.tournaments.map(t => t._id === id ? { ...t, status: 'Active' } : t),
                isLoading: false,
                isSuccess: true,
                message: 'Tournament started successfully'
            }));
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    deleteTournament: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            await api.delete(`/tournaments/${id}`);
            set((state) => ({
                tournaments: state.tournaments.filter(t => t._id !== id),
                activeTournament: null,
                isLoading: false,
                isSuccess: true,
                message: 'Tournament deleted successfully'
            }));
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    resetTournament: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.post(`/tournaments/${id}/reset`);
            set((state) => ({
                activeTournament: { ...state.activeTournament, status: 'Draft' }, // Optimistic update
                tournaments: state.tournaments.map(t => t._id === id ? { ...t, status: 'Draft' } : t),
                isLoading: false,
                isSuccess: true,
                message: 'Tournament reset successfully'
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

export default useTournamentStore;
