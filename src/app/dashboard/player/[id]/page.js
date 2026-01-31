"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/useAuthStore';

export default function PlayerTournamentDetailsPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [tournament, setTournament] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { default: api } = await import('@/lib/axios');
                
                // 1. Fetch Tournament Details (Public or Protected)
                // Using public endpoint for read-only details is fine, 
                // but we need authenticated context for matches.
                // Let's use the public one for tournament info:
                const tourRes = await api.get(`/public/tournaments/${params.id}`);
                setTournament(tourRes.data);

                // 2. Fetch My Registration to get Team Name
                // We fetch all player registrations and find the one for this tournament
                const regRes = await api.get('/player/registrations');
                const myReg = regRes.data.find(r => r.tournament._id === params.id || r.tournament === params.id);
                setMyTeam(myReg);

                // 3. Fetch Matches
                // We need an endpoint to fetch matches for this tournament.
                // The existing endpoint `/api/matches/tournament/[id]` might be admin only?
                // Let's check. If it is admin only, we might need a public/player one.
                // Assuming it's protected but tailored for visibility or just list all.
                // If it lists all, we filter.
                const matchRes = await api.get(`/matches/tournament/${params.id}`);
                setMatches(matchRes.data);

            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [params.id, user]);

    if (loading) return <div className="text-center text-white py-10">Loading...</div>;
    if (!tournament) return <div className="text-center text-white py-10">Tournament not found</div>;

    // Filter matches for my team
    const myMatches = matches.filter(m => 
        (m.team1?.name === myTeam?.teamName) || (m.team2?.name === myTeam?.teamName)
    );

    // Identify Pool/Group
    // If we have matches, we can see which group we are in?
    // Matches schema has 'group'.
    const myGroup = myMatches.length > 0 ? myMatches[0].group : null;

    // Filter "My Pool Teams" - Teams in the same group
    // We can extract unique team names from matches in this group
    const poolTeams = new Set();
    if (myGroup) {
        matches.filter(m => m.group === myGroup).forEach(m => {
            if (m.team1?.name) poolTeams.add(m.team1.name);
            if (m.team2?.name) poolTeams.add(m.team2.name);
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{tournament.title}</h1>
                    <p className="text-text-muted">{tournament.game} • {new Date(tournament.startDate).toLocaleDateString()}</p>
                </div>
                <Link href="/dashboard/player">
                    <Button variant="secondary" size="sm">Back</Button>
                </Link>
            </div>

            {/* My Team Status */}
            {myTeam && (
                <Card className="p-6 bg-surface-highlight border-primary/20">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">{myTeam.teamName}</h2>
                            <p className="text-sm text-text-muted">
                                Status: <span className="capitalize text-white">{myTeam.status}</span>
                            </p>
                            {myGroup && <p className="text-sm text-primary font-bold mt-1">Group: {myGroup}</p>}
                        </div>
                        <div className="text-right">
                            {myTeam.paymentStatus !== 'completed' ? (
                                <span className="inline-block px-3 py-1 rounded bg-orange-500/20 text-orange-500 text-sm font-bold">
                                    Payment Pending
                                </span>
                            ) : (
                                <span className="inline-block px-3 py-1 rounded bg-green-500/20 text-green-500 text-sm font-bold">
                                    Paid
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* My Matches */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">My Matches</h3>
                {myMatches.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-text-muted">No matches scheduled yet.</p>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {myMatches.map(match => (
                            <Card key={match._id} className="p-4 border border-white/5">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1 text-center">
                                        <div className={`font-bold text-lg ${match.team1.name === myTeam?.teamName ? 'text-primary' : 'text-white'}`}>
                                            {match.team1.name}
                                        </div>
                                        <div className="text-2xl font-mono text-white/50">{match.team1.score}</div>
                                    </div>
                                    <div className="px-4 text-center">
                                        <div className="text-xs text-text-muted uppercase mb-1">{match.status}</div>
                                        <div className="text-sm font-bold text-white/30">VS</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className={`font-bold text-lg ${match.team2.name === myTeam?.teamName ? 'text-primary' : 'text-white'}`}>
                                            {match.team2.name}
                                        </div>
                                        <div className="text-2xl font-mono text-white/50">{match.team2.score}</div>
                                    </div>
                                </div>
                                {match.winner && (
                                    <div className="text-center mt-3 pt-3 border-t border-white/5">
                                        <p className="text-sm text-green-400">
                                            Winner: {match.winner === 'team1' ? match.team1.name : match.team2.name}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Pool Teams (If Group Assigned) */}
            {myGroup && poolTeams.size > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">My Pool ({myGroup})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from(poolTeams).map(teamName => (
                            <Card key={teamName} className={`p-4 ${teamName === myTeam?.teamName ? 'border-primary/50 bg-primary/5' : 'border-white/5'}`}>
                                <h4 className={`font-medium ${teamName === myTeam?.teamName ? 'text-primary' : 'text-white'}`}>
                                    {teamName} {teamName === myTeam?.teamName && '(You)'}
                                </h4>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
