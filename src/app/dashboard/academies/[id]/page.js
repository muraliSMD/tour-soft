'use client';

import { useState, useEffect, use } from 'react';
import { Loader2, Trophy, Users, Edit, Activity, Calendar, PlayCircle } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import Link from 'next/link';
import api from '@/lib/axios';

import useAuthStore from '@/store/useAuthStore';

export default function AcademyOverviewPage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const { user } = useAuthStore();
    
    const [academy, setAcademy] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [academiaRes, tourneyRes, matchesRes] = await Promise.all([
                    api.get(`/academies/${id}`),
                    api.get(`/academies/${id}/tournaments`),
                    api.get(`/matches?academyId=${id}`)
                ]);

                const accData = academiaRes.data;
                const tourData = tourneyRes.data;
                
                // Matches API returns array directly
                const matchesData = matchesRes.data;

                if (accData.success) setAcademy(accData.data);
                if (tourData.success) setTournaments(tourData.data);
                if (Array.isArray(matchesData)) setMatches(matchesData);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Loader fullScreen text="Loading Academy Details..." />;
    if (!academy) return <div>Academy not found</div>;

    // Derived Stats
    const activeTournaments = tournaments.filter(t => t.status === 'Active').length;
    const upcomingTournaments = tournaments.filter(t => t.status === 'Draft' || t.status === 'Upcoming').length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalMatches = matches.length;

    return (
        <div className="space-y-8">
            {/* Header / Banner */}
            <div className="relative min-h-[10rem] sm:h-48 rounded-2xl overflow-hidden bg-surface border border-white/5 shadow-inner">
                {academy.bannerImage ? (
                    <img src={academy.bannerImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900 flex items-center justify-center">
                        <h1 className="text-2xl sm:text-4xl font-bold text-white/10">{academy.name}</h1>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
                         {academy.logo && (
                             <img src={academy.logo} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-white/20 bg-surface object-cover shadow-xl" alt="Logo" />
                         )}
                         <div className="flex-1">
                             <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-md">{academy.name}</h1>
                             <p className="text-white/80 text-xs sm:text-sm font-medium">{academy.location?.city || 'No Location'} • {academy.sports?.join(', ') || 'Sports Academy'}</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {user?.role === 'owner' && (
                    <>
                        <Link href={`/dashboard/tournaments/create?academy=${academy._id}`} className="bg-primary hover:bg-primary/90 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-medium transition">
                            <Trophy className="w-5 h-5" /> Create Tournament
                        </Link>
                        <Link href={`/dashboard/academies/${id}/team`} className="bg-surface hover:bg-surface-highlight border border-white/5 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-medium transition">
                            <Users className="w-5 h-5" /> Manage Admins
                        </Link>
                        <Link href={`/dashboard/academies/${id}/settings`} className="bg-surface hover:bg-surface-highlight border border-white/5 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-medium transition">
                            <Edit className="w-5 h-5" /> Edit Details
                        </Link>
                    </>
                )}
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-surface rounded-xl border border-white/5 p-4 sm:p-6 shadow-sm">
                    <div className="text-text-muted text-[10px] sm:text-sm font-medium mb-1 flex items-center gap-2">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /> <span className="truncate">Active Tournaments</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{activeTournaments}</div>
                </div>
                <div className="bg-surface rounded-xl border border-white/5 p-4 sm:p-6 shadow-sm">
                    <div className="text-text-muted text-[10px] sm:text-sm font-medium mb-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" /> <span className="truncate">Upcoming</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{upcomingTournaments}</div>
                </div>
                 <div className="bg-surface rounded-xl border border-white/5 p-4 sm:p-6 shadow-sm">
                    <div className="text-text-muted text-[10px] sm:text-sm font-medium mb-1 flex items-center gap-2">
                        <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" /> <span className="truncate">Total Matches</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{totalMatches}</div>
                </div>
                 <div className="bg-surface rounded-xl border border-white/5 p-4 sm:p-6 shadow-sm">
                    <div className="text-text-muted text-[10px] sm:text-sm font-medium mb-1 flex items-center gap-2">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" /> <span className="truncate">Completed</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{completedMatches}</div>
                </div>
            </div>

             {/* Recent Tournaments Table */}
             <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Tournaments</h2>
                    <Link href="/dashboard/tournaments" className="text-sm text-primary hover:underline">View All</Link>
                </div>
                 {tournaments.length === 0 ? (
                    <div className="p-8 text-center text-text-muted">No tournaments found.</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {tournaments.slice(0, 5).map(t => (
                            <Link key={t._id} href={`/dashboard/tournaments/${t._id}`} className="block p-4 hover:bg-white/5 transition">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-white line-clamp-1">{t.title}</div>
                                        <div className="text-sm text-text-muted">{t.game} • {t.format} • {new Date(t.startDate).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                                        t.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                                        t.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-500' : 
                                        'bg-white/5 text-text-muted'
                                    }`}>
                                        {t.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
}
