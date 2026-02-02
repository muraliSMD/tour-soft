"use client";

import React from 'react';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import useTournamentStore from '@/store/useTournamentStore';

export default function TournamentOverviewPage() {
    const { activeTournament } = useTournamentStore();

    if (!activeTournament) {
        return <Loader text="Loading Tournament Details..." />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">Tournament Description</h2>
                    <Card className="p-6">
                        <p className="text-text-muted leading-relaxed">
                            Welcome to {activeTournament.title}! This tournament features {activeTournament.game} in a {activeTournament.format} format with up to {activeTournament.maxParticipants} teams.
                        </p>
                    </Card>
                </section>

                <section>
                     <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                     <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start border-b border-white/5 pb-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-text-muted">
                                        <span className="text-white font-medium">System</span> created the tournament.
                                    </p>
                                    <span className="text-xs text-text-muted/50">Recently</span>
                                </div>
                            </div>
                        </div>
                     </Card>
                </section>
            </div>

            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="font-semibold text-white mb-4">Information</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Format</span>
                            <span className="text-white font-medium">{activeTournament.format}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Max Teams</span>
                            <span className="text-white font-medium">{activeTournament.maxParticipants}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Status</span>
                            <span className="text-white font-medium">{activeTournament.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Event</span>
                            <span className="text-white font-medium">{activeTournament.event || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Check-in</span>
                            <span className="text-white font-medium">Disabled</span>
                        </div>
                    </div>
                </Card>

                 <Card className="p-6">
                    <h3 className="font-semibold text-white mb-4">Share Registration</h3>
                     <div className="flex gap-2">
                        <input 
                            readOnly 
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register/${activeTournament._id}`}
                            className="bg-surface-highlight border border-white/10 rounded px-3 py-1.5 text-sm text-text-muted w-full focus:outline-none"
                        />
                        <button 
                            onClick={() => {
                                const url = `${window.location.origin}/register/${activeTournament._id}`;
                                navigator.clipboard.writeText(url);
                                alert("Link copied!");
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white p-2 rounded border border-white/10 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                 </Card>
            </div>
        </div>
    );
}
