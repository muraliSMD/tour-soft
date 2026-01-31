import { create } from 'zustand';
import api from '@/lib/axios';

const useMatchStore = create((set) => ({
    matches: [],
    activeMatch: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',

    getMatches: async () => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get('/matches');
            set({ matches: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    getTournamentMatches: async (tournamentId) => {
        set({ isLoading: true, isError: false, matches: [] }); // Clear prev matches
        try {
            const response = await api.get(`/matches/tournament/${tournamentId}`);
            set({ matches: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    getMatch: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get(`/matches/${id}`);
            set({ activeMatch: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    fetchAssignedMatches: async () => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.get('/matches/assigned');
            set({ matches: response.data, isLoading: false, isSuccess: true });
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
        }
    },

    createMatch: async (matchData) => {
        set({ isLoading: true, isError: false, message: '' });
        try {
            const response = await api.post('/matches', matchData);
            set((state) => ({
                matches: [...state.matches, response.data],
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

    assignReferee: async (matchId, refereeId) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/matches/${matchId}/assign-referee`, { refereeId });
            set((state) => ({
                matches: state.matches.map(m => 
                    m._id === matchId ? response.data : m
                ),
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

    updateScore: async (matchId, team) => {
        // Optimistic or just background update - don't trigger global loading
        set({ isError: false });
        try {
            const response = await api.put(`/matches/${matchId}/score`, { team });
            set({ activeMatch: response.data, isSuccess: true });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message });
            throw error;
        }
    },

    undoScore: async (matchId) => {
        set({ isError: false });
        try {
            const response = await api.put(`/matches/${matchId}/undo`);
            set({ activeMatch: response.data, isSuccess: true });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message });
            throw error;
        }
    },

    deleteMatch: async (id) => {
        set({ isLoading: true, isError: false });
        try {
            await api.delete(`/matches/${id}`);
            set((state) => ({
                matches: state.matches.filter((m) => m._id !== id),
                isLoading: false,
                isSuccess: true,
            }));
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            set({ isError: true, message, isLoading: false });
            throw error;
        }
    },

    updateMatchStatus: async (id, status) => {
        set({ isLoading: true, isError: false });
        try {
            const response = await api.put(`/matches/${id}`, { status });
            set((state) => ({
                matches: state.matches.map((m) =>
                    m._id === id ? { ...m, status: response.data.status } : m
                ),
                activeMatch: response.data,
                isLoading: false,
                isSuccess: true,
            }));
            return response.data;
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

export default useMatchStore;
