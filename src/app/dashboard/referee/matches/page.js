"use client";

import React, { useEffect } from 'react';
import useMatchStore from '@/store/useMatchStore';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function RefereeMatchesPage() {
    const { matches, fetchAssignedMatches, isLoading } = useMatchStore();

    useEffect(() => {
        fetchAssignedMatches();
    }, [fetchAssignedMatches]);

    if (isLoading) return <div className="text-white">Loading matches...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">My Assigned Matches</h1>
                <p className="text-text-muted">Matches you are officiating.</p>
            </div>

            <div className="grid gap-4">
                {matches.length === 0 ? (
                    <Card className="p-8 text-center text-text-muted">
                        No matches currently assigned to you.
                    </Card>
                ) : (
                    matches.map((match) => (
                        <Card key={match._id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-1">
                                <div className="text-sm text-primary mb-1">{match.tournament?.name || 'Tournament Match'}</div>
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
                                    Status: <span className="uppercase">{match.status}</span> | Round: {match.round} | Match #: {match.matchNumber}
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
