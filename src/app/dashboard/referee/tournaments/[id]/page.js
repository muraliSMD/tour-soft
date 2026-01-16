"use client";

import React, { useEffect, useState } from 'react';
import useMatchStore from '@/store/useMatchStore';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useParams } from 'next/navigation';

export default function RefereeTournamentMatchesPage() {
    const { id } = useParams(); // Tournament ID
    const { matches, fetchAssignedMatches, isLoading } = useMatchStore();
    const [filteredMatches, setFilteredMatches] = useState([]);

    useEffect(() => {
        // If matches not loaded or we want to ensure freshness
        fetchAssignedMatches();
    }, [fetchAssignedMatches]);

    useEffect(() => {
        if (matches && id) {
            setFilteredMatches(matches.filter(m => m.tournament && m.tournament._id === id));
        }
    }, [matches, id]);

    if (isLoading) return <div className="text-white">Loading matches...</div>;

    const tournamentName = filteredMatches[0]?.tournament?.title || 'Tournament';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white max-w-2xl truncate">{tournamentName}</h1>
                    <p className="text-text-muted">Your Assigned Matches</p>
                </div>
                <Link href="/dashboard">
                    <Button variant="ghost">Back to Dashboard</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {filteredMatches.length === 0 ? (
                    <Card className="p-8 text-center text-text-muted">
                        No matches found for this tournament.
                    </Card>
                ) : (
                    filteredMatches.map((match) => (
                        <Card key={match._id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 text-white text-lg font-bold">
                                    <span className={match.winner === match.team1?._id ? 'text-green-400' : ''}>
                                        {match.team1?.name || 'TBD'}
                                    </span>
                                    <span className="text-text-muted text-sm px-2">VS</span>
                                    <span className={match.winner === match.team2?._id ? 'text-green-400' : ''}>
                                        {match.team2?.name || 'TBD'}
                                    </span>
                                </div>
                                <div className="text-sm text-text-muted mt-2">
                                    Status: <span className="uppercase font-medium text-white">{match.status}</span> | Round: {match.round} | Match #: {match.matchNumber}
                                </div>
                            </div>
                            
                            <Link href={`/dashboard/tournaments/${match.tournament?._id}/matches/${match._id}`}>
                                <Button>
                                    {match.status === 'completed' ? 'View Details' : 'Enter Score'}
                                </Button>
                            </Link>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
