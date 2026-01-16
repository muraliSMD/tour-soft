import { create } from 'zustand';
import api from '@/lib/axios';

const useMemberStore = create((set) => ({
    members: [],
    loading: false,
    error: null,

    fetchMembers: async (userId = null) => {
        set({ loading: true });
        try {
            const url = userId ? `/members?user=${userId}` : '/members';
            const res = await api.get(url);
            set({ members: res.data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    addMember: async (data) => {
        try {
            const res = await api.post('/members', data);
            set((state) => ({ members: [...state.members, res.data] }));
            return res.data;
        } catch (err) {
            throw err;
        }
    },

    deleteMember: async (id) => {
        try {
            await api.delete(`/members/${id}`);
            set((state) => ({ members: state.members.filter(m => m._id !== id) }));
        } catch (err) {
            throw err;
        }
    }
}));

export default useMemberStore;
