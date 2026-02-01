"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function PublicTournamentPage() {
    const params = useParams();
    const [tournament, setTournament] = useState(null);
    const [matches, setMatches] = useState([]);
    const [registrations, setRegistrations] = useState([]); // Store registrations to find player names
    const [loading, setLoading] = useState(true);

    const fetchData = async (isPolling = false) => {
        try {
            // When polling, we might only want matches, but fetching all ensures sync
            const requests = [
                api.get(`/tournaments/${params.id}`),
                api.get(`/matches/tournament/${params.id}`)
            ];
            
            // Only fetch registrations once initially or if needed
            if (!isPolling) {
                requests.push(api.get(`/public/tournaments/${params.id}/teams`)); 
            }

            const results = await Promise.all(requests);
            
            const [tRes, mRes] = results;
            const regRes = !isPolling ? results[2] : null;

            const tData = tRes.data.success ? tRes.data.data : tRes.data;
            setTournament(tData);
            setMatches(mRes.data);
            
            if (regRes) {
                 setRegistrations(regRes.data.success ? regRes.data.data : regRes.data);
            }

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            // Initial Fetch
            fetchData();

            // Poll every 5 seconds for live scores
            const intervalId = setInterval(() => {
                fetchData(true);
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [params.id]);

    if (loading) return <Loader fullScreen text="Loading Tournament..." />;
    if (!tournament) return <div className="text-white text-center py-20">Tournament not found</div>;

    const isRegistrationOpen = tournament.status === 'Draft' || tournament.status === 'Upcoming';
    const showMatches = tournament.status === 'Active' || tournament.status === 'Completed';

    const liveMatches = matches.filter(m => m.status === 'in-progress');
    const completedMatches = matches.filter(m => m.status === 'completed');
    const upcomingMatches = matches.filter(m => m.status === 'pending');

    // Helper to find members by team name (Case Insensitive)
    const getTeamMembers = (teamName) => {
        if (!teamName) return [];
        const normalizedTeamName = teamName.toLowerCase().trim();
        const reg = registrations.find(r => (r.teamName || '').toLowerCase().trim() === normalizedTeamName);
        return reg ? reg.teamMembers : [];
    };

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Breadcrumbs />
                
                {/* Header */}
                <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-white mb-4">{tournament.title}</h1>
                        <div className="flex justify-center gap-4 text-text-muted mb-6">
                            <span>{tournament.game}</span>
                            <span>•</span>
                            <span>{tournament.format}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                tournament.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                                tournament.status === 'Completed' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-yellow-500/10 text-yellow-500'
                            }`}>
                                {tournament.status}
                            </span>
                        </div>

                        {/* Registration CTA */}
                        {isRegistrationOpen ? (
                            <Link href={`/tournaments/${params.id}/register`}>
                                <Button size="lg" className="animate-pulse">Register Now</Button>
                            </Link>
                        ) : (
                            <div className="p-4 bg-white/5 rounded-lg inline-block border border-white/10">
                                <p className="text-text-muted">Registration is closed. View live scores below.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Match List (Only if Active/Completed) */}
                {showMatches && (
                    <div className="space-y-8">
                        
                        {/* Live Matches */}
                        {liveMatches.length > 0 && (
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        <h2 className="text-xl font-bold text-white">Live Matches</h2>
                                    </div>
                                    <span className="text-xs text-text-muted animate-pulse">Updating live...</span>
                                </div>
                               
                                <div className="grid gap-4">
                                    {liveMatches.map(match => (
                                        <MatchCard 
                                            key={match._id} 
                                            match={match} 
                                            getTeamMembers={getTeamMembers}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Upcoming Matches (If Active) */}
                        {tournament.status === 'Active' && upcomingMatches.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-white mb-4">Upcoming Matches</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {upcomingMatches.map(match => (
                                        <MatchCard 
                                            key={match._id} 
                                            match={match} 
                                            simple 
                                            getTeamMembers={getTeamMembers}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Completed Results - Grouped by Round */}
                        {completedMatches.length > 0 && (
                            <section>
                                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Recent Results</h2>
                                
                                {(() => {
                                    // Group matches by Round Name
                                    const groupedResults = completedMatches.reduce((acc, match) => {
                                        const roundName = match.group || (match.round ? `Round ${match.round}` : 'Other Matches');
                                        if (!acc[roundName]) acc[roundName] = [];
                                        acc[roundName].push(match);
                                        return acc;
                                    }, {});

                                    const sortedGroups = Object.keys(groupedResults); // You might want custom sorting here if needed

                                    return (
                                        <div className="space-y-8">
                                            {sortedGroups.map(groupName => (
                                                <div key={groupName}>
                                                    <h3 className="text-lg font-semibold text-primary mb-3 px-1">{groupName}</h3>
                                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                        {groupedResults[groupName].map(match => (
                                                            <MatchCard 
                                                                key={match._id} 
                                                                match={match} 
                                                                getTeamMembers={getTeamMembers}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </section>
                        )}

                        {matches.length === 0 && (
                            <div className="text-center py-10 text-text-muted">
                                Matches have not been scheduled yet.
                            </div>
                        )}
                    </div>
                )}

                 {/* Participants / Teams List */}
                 {registrations.length > 0 && (
                    <section className="pt-8 border-t border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">Participants</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {registrations.map((reg) => (
                                <Card key={reg._id} className="p-4 bg-surface/50 border-white/5">
                                    <div className="font-semibold text-white">{reg.teamName}</div>
                                    <div className="text-sm text-text-muted mt-1">
                                        {reg.teamMembers.map(m => m.name).join(', ')}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function MatchCard({ match, simple, getTeamMembers }) {
    const team1Name = match.team1?.name || (typeof match.team1 === 'string' ? match.team1 : 'N/A');
    const team2Name = match.team2?.name || (typeof match.team2 === 'string' ? match.team2 : 'N/A');
    
    // Fetch members if function provided
    const team1Members = getTeamMembers ? getTeamMembers(team1Name) : [];
    const team2Members = getTeamMembers ? getTeamMembers(team2Name) : [];
    
    // Format members string: "John, Doe"
    const t1MembersStr = team1Members.map(m => m.name).join(', ');
    const t2MembersStr = team2Members.map(m => m.name).join(', ');

    return (
        <Card className="p-4 hover:border-primary/30 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center justify-between w-full md:w-auto md:gap-8 flex-1">
                    {/* Team 1 */}
                    <div className={`flex-1 text-right ${match.winner === 'team1' ? 'text-green-500 font-bold' : 'text-white'}`}>
                        <div className="text-lg">{team1Name}</div>
                        {t1MembersStr && t1MembersStr !== team1Name && (
                            <div className="text-xs text-text-muted">{t1MembersStr}</div>
                        )}
                        {!simple && <div className="text-3xl font-mono mt-1">{match.team1?.score || 0}</div>}
                    </div>

                    {/* VS / Status */}
                    <div className="px-4 text-center">
                        {/* Display Round/Group Name */}
                        {(match.group || match.round) && (
                            <div className="text-xs font-bold text-primary mb-1">
                                {match.group || `Round ${match.round}`}
                            </div>
                        )}
                        <div className="text-xs text-text-muted mb-1">vs</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${
                            match.status === 'in-progress' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            match.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            'bg-white/5 text-text-muted border-white/10'
                        }`}>
                            {match.status === 'in-progress' ? 'LIVE' : match.status}
                        </span>
                    </div>

                    {/* Team 2 */}
                    <div className={`flex-1 text-left ${match.winner === 'team2' ? 'text-green-500 font-bold' : 'text-white'}`}>
                        <div className="text-lg">{team2Name}</div>
                        {t2MembersStr && t2MembersStr !== team2Name && (
                             <div className="text-xs text-text-muted">{t2MembersStr}</div>
                        )}
                        {!simple && <div className="text-3xl font-mono mt-1">{match.team2?.score || 0}</div>}
                    </div>
                </div>
            </div>
        </Card>
    );
}
