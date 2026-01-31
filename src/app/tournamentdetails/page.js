"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Card from '@/components/ui/Card';
import api from '@/lib/axios';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function TournamentDetailsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                // Fetching all (or active) tournaments. 
                // Using existing /tournaments endpoint which might need 'public' filter in future but for now listing all.
                const res = await api.get('/tournaments');
                setTournaments(res.data);
            } catch (error) {
                console.error('Failed to fetch tournaments', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    const filteredTournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Breadcrumbs />
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Upcoming Tournaments</h1>
                        <p className="text-text-muted mt-2">Join the action and compete for glory</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search tournaments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-text-muted">Loading tournaments...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTournaments.length === 0 && <p className="text-text-muted col-span-3 text-center">No tournaments found.</p>}
                        
                        {filteredTournaments.map(tournament => (
                            <Card key={tournament._id} className="group hover:border-primary/50 transition-colors">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-surface-highlight flex items-center justify-center text-2xl">
                                            🏆
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                            tournament.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                            tournament.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                            {tournament.status}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                        {tournament.name}
                                    </h3>
                                    
                                    <div className="space-y-2 text-sm text-text-muted mb-6">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="capitalize">{tournament.type} Tournament</span>
                                        </div>
                                    </div>
                                    <Link href={`/tournaments/${tournament.slug || tournament._id}/register`} className="block">
                                         <Button className="w-full">View Details & Register</Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
