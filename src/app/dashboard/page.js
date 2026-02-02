"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import useTournamentStore from '@/store/useTournamentStore';
import useMatchStore from '@/store/useMatchStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { tournaments, getTournaments } = useTournamentStore();
    const { matches, getMatches, fetchAssignedMatches } = useMatchStore(); // Get fetchAssignedMatches
    
    const [stats, setStats] = useState({
        activeTournaments: 0,
        totalMatches: 0,
        recentMatches: 0,
        completedMatches: 0
    });

    useEffect(() => {
        if (user) {
            if (user.role === 'player' || user.role === 'user') {
                router.replace('/dashboard/player');
                return;
            }
            
            if (user.role === 'referee') {
                fetchAssignedMatches();
            } else {
                getTournaments();
                getMatches();
            }
        }
    }, [getTournaments, getMatches, fetchAssignedMatches, user, router]);

    if (user?.role === 'player' || user?.role === 'user') {
        return <Loader fullScreen text="Redirecting to Player Dashboard..." />;
    }

    // Referee View Logic
    const refereeTournaments = [];
    if (user?.role === 'referee' && matches) {
        // Deriving unique tournaments from assigned matches
        const map = new Map();
        matches.forEach(m => {
            if (m.tournament && !map.has(m.tournament._id)) {
                map.set(m.tournament._id, m.tournament);
            }
        });
        refereeTournaments.push(...map.values());
    }

    // Common Stats Logic
    useEffect(() => {
        if (tournaments && matches && user?.role !== 'referee') {
             const activeTournaments = tournaments.filter(t => t.status === 'Active').length;
            const totalMatches = matches.length;
            const recentMatches = matches.filter(m => {
                const matchDate = new Date(m.createdAt);
                const daysDiff = (new Date() - matchDate) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            }).length;
            const completedMatches = matches.filter(m => m.status === 'completed').length;
            setStats({ activeTournaments, totalMatches, recentMatches, completedMatches });
        }
    }, [tournaments, matches, user]);

    const recentMatchesList = matches?.slice(0, 5) || [];

    // --- REFEREE VIEW ---
    if (user?.role === 'referee') {
        return (
            <div className="space-y-8">
                 <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Referee Dashboard</h1>
                    <p className="text-text-muted">Welcome back, {user?.name}. Here are your assigned tournaments.</p>
                </div>
                
                <div>
                     <h2 className="text-lg font-semibold text-white mb-4">Tournaments</h2>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {refereeTournaments.length > 0 ? (
                            refereeTournaments.map(tournament => (
                                <Link key={tournament._id} href={`/dashboard/referee/tournaments/${tournament._id}`}>
                                    <Card className="group hover:border-primary/30 transition-colors cursor-pointer p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                             <div className="h-12 w-12 rounded-lg bg-surface-highlight flex items-center justify-center font-bold text-xl text-primary">
                                                {tournament.title?.charAt(0) || 'T'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                                    {tournament.title || 'Unnamed Tournament'}
                                                </h3>
                                                <p className="text-sm text-text-muted">Assigned Matches</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                             <span className="text-sm text-text-muted">
                                                Click to view matches
                                             </span>
                                             <Button size="sm" variant="secondary">View</Button>
                                        </div>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <Card className="p-8 text-center col-span-3">
                                <p className="text-text-muted">No tournaments assigned yet.</p>
                            </Card>
                        )}
                     </div>
                </div>
            </div>
        );
    }

    // --- OWNER & ADMIN VIEW ---
    const [academies, setAcademies] = useState([]);
    
    useEffect(() => {
        if (user?.role === 'owner' || user?.role === 'admin') {
            const fetchAcademies = async () => {
                try {
                    const response = await api.get('/academies');
                    setAcademies(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch academies", error);
                }
            };
            fetchAcademies();
        }
    }, [user]);

    if (user?.role === 'owner' || user?.role === 'admin') {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                     <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white">{user.role === 'owner' ? 'Owner' : 'Admin'} Dashboard</h1>
                        <p className="text-text-muted">Manage your Academies</p>
                     </div>
                     {user.role === 'owner' && (
                        <Link href="/dashboard/academies/create">
                            <Button>+ Create New Academy</Button>
                        </Link>
                     )}
                </div>

                {academies.length === 0 ? (
                     <Card className="p-12 text-center">
                        <p className="text-text-muted mb-4">You are not associated with any academies yet.</p>
                        {user.role === 'owner' && (
                            <Link href="/dashboard/academies/create">
                                <Button>Create Your First Academy</Button> 
                            </Link>
                        )}
                    </Card>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {academies.map((academy) => (
                        <Link key={academy._id} href={`/dashboard/academies/${academy._id}`}>
                            <Card className="p-6 hover:border-primary/30 transition-all cursor-pointer group h-full flex flex-col">
                                <div className="flex items-center gap-4 mb-4">
                                    {academy.logo && academy.logo !== 'no-photo.jpg' ? (
                                        <img src={academy.logo} alt={academy.name} className="h-14 w-14 rounded-xl object-cover border border-white/10" />
                                    ) : (
                                        <div className="h-14 w-14 rounded-xl bg-surface-highlight flex items-center justify-center text-xl font-bold text-primary border border-white/5">
                                            {academy.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                                            {academy.name}
                                        </h3>
                                        <p className="text-xs text-text-muted uppercase tracking-wider">{academy.location?.city || 'No Location'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-text-muted flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 opacity-50">🏆</span>
                                        {academy.sports && academy.sports.length > 0 ? academy.sports.join(', ') : 'Badminton'}
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-medium text-text-muted group-hover:text-white transition-colors">Manage Academy</span>
                                    <span className="text-primary group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                    
                    {/* Add New Academy Card - Only for Owner */}
                    {user.role === 'owner' && (
                        <Link href="/dashboard/academies/create">
                            <Card className="p-6 h-full flex flex-col items-center justify-center border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer min-h-[200px]">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl text-primary mb-3">
                                    <Plus />
                                </div>
                                <span className="font-medium text-white">Add New Academy</span>
                            </Card>
                        </Link>
                    )}
                </div>
                )}
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {/* Header / Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-text-muted">
                        Welcome back, {user?.name || 'organizer'}.
                        {user?.role === 'admin' && user?.sports?.length > 0 && (
                            <span> Managing: {user.sports.join(', ')}</span>
                        )}
                    </p>
                </div>
                <Link href="/dashboard/tournaments/create">
                    <Button>+ Create Tournament</Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Active Tournaments</div>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stats.activeTournaments}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Total Matches</div>
                    <div className="text-3xl font-bold text-white">{stats.totalMatches}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Recent Matches (7d)</div>
                    <div className="text-3xl font-bold text-white">{stats.recentMatches}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Completed Matches</div>
                    <div className="text-3xl font-bold text-white">{stats.completedMatches}</div>
                </Card>
            </div>

            {/* Recent Matches */}
            {recentMatchesList.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Matches</h2>
                        <Link href="/dashboard/tournaments">
                            <Button variant="ghost" size="sm">View All Tournaments</Button>
                        </Link>
                    </div>
                    
                    <div className="grid gap-4">
                        {recentMatchesList.map((match) => (
                            <Card key={match._id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-text-muted text-sm">Match #{match.matchNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                match.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                match.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                                {match.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-white font-medium">{match.team1.name}</p>
                                                <p className="text-2xl font-bold text-primary">{match.team1.score}</p>
                                            </div>
                                            <span className="text-text-muted">vs</span>
                                            <div className="text-center">
                                                <p className="text-white font-medium">{match.team2.name}</p>
                                                <p className="text-2xl font-bold text-primary">{match.team2.score}</p>
                                            </div>
                                        </div>
                                        {match.winner && (
                                            <p className="text-green-500 text-sm mt-2">
                                                Winner: {match.winner === 'team1' ? match.team1.name : match.team2.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-text-muted mb-2">Target: {match.targetScore}</p>
                                        {match.referee && (
                                            <p className="text-xs text-text-muted">Ref: {match.referee.name}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Tournaments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Your Tournaments</h2>
                    <Link href="/dashboard/tournaments">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tournaments && tournaments.length > 0 ? (
                        tournaments.slice(0, 4).map((tournament) => (
                            <Link key={tournament._id} href={`/dashboard/tournaments/${tournament._id}`}>
                                <Card className="group hover:border-primary/30 transition-colors cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-surface-highlight flex items-center justify-center font-bold text-xl text-primary">
                                                {tournament.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                                    {tournament.title}
                                                </h3>
                                                <p className="text-sm text-text-muted">{tournament.game}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                            tournament.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            tournament.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-white/5 text-text-muted border-white/10'
                                        }`}>
                                            {tournament.status}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 my-4">
                                        <div>
                                            <div className="text-xs text-text-muted">Event Type</div>
                                            <div className="font-medium text-white text-sm">
                                                {tournament.event || tournament.format}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-text-muted">Max Participants</div>
                                            <div className="font-medium text-white text-sm">{tournament.maxParticipants}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-xs text-text-muted">
                                            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBD'}
                                        </span>
                                        <Button size="sm" variant="secondary">Manage</Button>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card className="p-8 text-center col-span-2">
                            <p className="text-text-muted mb-4">No tournaments yet</p>
                            <Link href="/dashboard/tournaments/create">
                                <Button>Create Your First Tournament</Button> 
                            </Link>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
