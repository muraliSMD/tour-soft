'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, ExternalLink } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';

export default function MyAcademiesPage() {
    const { user } = useAuthStore();
    const [academies, setAcademies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyAcademies();
        }
    }, [user]);

    const fetchMyAcademies = async () => {
        try {
            const res = await api.get('/academies');
            const data = res.data;
            
            if (data.success) {
                // API now returns filtered list based on user context
                setAcademies(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader fullScreen text="Loading your academies..." />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">My Academies</h1>
                {user?.role === 'owner' && (
                    <Link 
                        href="/dashboard/academies/create"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition"
                    >
                        <Plus className="w-4 h-4" />
                        Create Academy
                    </Link>
                )}
            </div>

            {academies.length === 0 ? (
                <div className="bg-surface rounded-xl p-12 text-center border border-white/5">
                    <h3 className="text-xl font-medium text-white mb-2">No Academies Yet</h3>
                    <p className="text-text-muted mb-6">
                        {user?.role === 'owner' 
                            ? "Create your first academy to start managing tournaments." 
                            : "You haven't been added to any academies yet."}
                    </p>
                    {user?.role === 'owner' && (
                        <Link 
                            href="/dashboard/academies/create"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition"
                        >
                            Create Now
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {academies.map(academy => (
                        <div key={academy._id} className="bg-surface rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition">
                            <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 relative">
                                {academy.logo && academy.logo !== 'no-photo.jpg' && (
                                    <img src={academy.logo} alt={academy.name} className="w-full h-full object-cover opacity-60" />
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{academy.name}</h3>
                                <div className="text-sm text-text-muted mb-4">
                                    {academy.location?.city || 'No Location'}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Link 
                                        href={`/dashboard/academies/${academy._id || academy.slug}/settings`}
                                        className="flex-1 flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg transition text-sm"
                                    >
                                        <Edit className="w-4 h-4" /> Manage
                                    </Link>
                                    <Link 
                                        href={`/academies/${academy.slug || academy._id}`}
                                        target="_blank"
                                        className="flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white px-3 py-2 rounded-lg transition"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
