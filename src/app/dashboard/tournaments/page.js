"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import useTournamentStore from '@/store/useTournamentStore';
import useAuthStore from '@/store/useAuthStore';

export default function TournamentsListPage() {
    const { tournaments, getTournaments, isLoading } = useTournamentStore();
    const { user } = useAuthStore();

    useEffect(() => {
        getTournaments();
    }, [getTournaments]);

    if (isLoading) {
        return <Loader fullScreen text="Loading tournaments..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Tournaments</h1>
                    <p className="text-text-muted">Manage your upcoming and past events.</p>
                </div>
                {user?.role !== 'referee' && (
                    <Link href="/dashboard/tournaments/create">
                        <Button>+ Create Tournament</Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tournaments.length === 0 ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4 text-text-muted">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No Tournaments found</h3>
                        <p className="text-text-muted mb-6">Get started by creating your first tournament.</p>
                        {user?.role !== 'referee' && (
                            <Link href="/dashboard/tournaments/create">
                                <Button>Create Tournament</Button>
                            </Link>
                        )}
                    </Card>
                ) : (
                    tournaments.map((t) => (
                        <Card key={t._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-surface-highlight flex items-center justify-center text-lg font-bold text-primary">
                                    {t.title.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                                        <Link href={`/dashboard/tournaments/${t._id}`} className="focus:outline-none">
                                            {t.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-text-muted">
                                        <span>{t.game}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                        <span>{t.maxParticipants} max</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    t.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    t.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                    'bg-white/5 text-text-muted border-white/10'
                                }`}>
                                    {t.status}
                                </span>
                                <Link href={`/dashboard/tournaments/${t._id}`}>
                                    <Button variant="secondary" size="sm">Manage</Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
