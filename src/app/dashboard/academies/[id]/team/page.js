'use client';

import { useState, useEffect, use } from 'react';
import { Loader2, Plus, Mail, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/store/useAuthStore';

export default function AcademyTeamPage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const { user } = useAuthStore();
    
    // Determine if current user is the owner of this academy
    // We can check associatedAcademies or if user.role is owner (platform owner usually owns all their created academies)
    // A more robust check: find the association for this academy ID.
    const academyRole = user?.associatedAcademies?.find(a => 
        (a.academy._id || a.academy) === id
    )?.role;
    
    // Also check if user is the direct owner (schema root level) if that's how it's stored, 
    // but associatedAcademies should track it.
    // Fallback: if user.role is 'owner' (platform level), they likely own it, but let's stick to the specific academy role if possible.
    // Actually, platform 'owner' role implies ownership of created academies.
    const isOwner = academyRole === 'owner' || user?.role === 'owner';

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (id) {
             fetchMembers();
        }
    }, [id]);

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/academies/${id}/members`);
            const data = res.data;
            if (data.success) {
                // Filter out the owner from the visual list
                const staffOnly = data.data.filter(m => m.role !== 'owner');
                setMembers(staffOnly);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        setError(null);
        setSuccess(null);

        try {
             const res = await api.post(`/academies/${id}/members`, { email: inviteEmail, role: 'admin' });
             const data = res.data;

            if (data.success) {
                setSuccess('User added successfully');
                setInviteEmail('');
                fetchMembers(); // refresh list
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add user');
        } finally {
            setInviting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {isOwner && (
                <div className="bg-surface rounded-xl border border-white/5 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
                    
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                     {success && (
                        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-muted mb-1.5">User Email</label>
                             <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Enter email address"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={inviting || !inviteEmail}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                             {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                             Add Admin
                        </button>
                    </form>
                    <p className="text-[10px] sm:text-xs text-text-muted mt-3 italic">User must already be registered on the platform.</p>
                </div>
            )}

            <div>
                 <h2 className="text-xl font-bold text-white mb-4">Admins & Staff ({members.length})</h2>
                 <div className="space-y-3">
                     {members.map(member => (
                          <div key={member._id} className="bg-surface rounded-xl border border-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-white/10 transition-all">
                             <div className="flex items-center gap-3 w-full sm:w-auto">
                                 <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg ${
                                     member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                 }`}>
                                     {member.name?.[0]?.toUpperCase() || 'U'}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                     <div className="font-bold text-white flex items-center gap-2 truncate">
                                         {member.name}
                                         {member.role === 'owner' && (
                                             <span className="flex-shrink-0 text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">
                                                 Owner
                                             </span>
                                         )}
                                     </div>
                                     <div className="text-xs sm:text-sm text-text-muted truncate">{member.email}</div>
                                 </div>
                             </div>
                             <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                 {member.role !== 'owner' && (
                                     <>
                                        <span className="bg-white/5 text-text-muted px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase border border-white/10 tracking-wider">
                                            {member.role}
                                        </span>
                                        {isOwner && (
                                            <button
                                                onClick={async () => {
                                                    if(!confirm('Are you sure you want to remove this admin?')) return;
                                                    try {
                                                        await api.delete(`/academies/${id}/members`, { data: { userId: member._id } });
                                                        fetchMembers();
                                                    } catch(e) {
                                                        alert('Failed to remove admin');
                                                    }
                                                }}
                                                className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                                                title="Remove Admin"
                                            >
                                                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                            </button>
                                        )}
                                     </>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
}
