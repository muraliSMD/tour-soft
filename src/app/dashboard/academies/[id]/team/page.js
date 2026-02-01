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

                    <form onSubmit={handleInvite} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-muted mb-1">User Email</label>
                             <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Enter email address"
                            />
                             <p className="text-xs text-text-muted mt-1">User must already be registered on the platform.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={inviting || !inviteEmail}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 mb-0.5"
                        >
                             {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                             Add Admin
                        </button>
                    </form>
                </div>
            )}

            <div>
                 <h2 className="text-xl font-bold text-white mb-4">Admins & Staff ({members.length})</h2>
                 <div className="space-y-3">
                     {members.map(member => (
                         <div key={member._id} className="bg-surface rounded-lg border border-white/5 p-4 flex items-center justify-between group">
                             <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                     member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                                 }`}>
                                     {member.name?.[0]?.toUpperCase() || 'U'}
                                 </div>
                                 <div>
                                     <div className="font-medium text-white flex items-center gap-2">
                                         {member.name}
                                         {member.role === 'owner' && (
                                             <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                 Owner
                                             </span>
                                         )}
                                     </div>
                                     <div className="text-sm text-text-muted">{member.email}</div>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3">
                                 {member.role !== 'owner' && (
                                     <>
                                        <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-medium uppercase border border-white/10">
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
                                                className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Admin"
                                            >
                                                <Trash2 className="w-4 h-4" />
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
