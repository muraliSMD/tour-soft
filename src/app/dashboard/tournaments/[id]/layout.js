"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import TournamentHeader from '@/components/tournament/TournamentHeader';
import useTournamentStore from '@/store/useTournamentStore';

export default function TournamentLayout({ children }) {
    const params = useParams();
    const { activeTournament, getTournament, isLoading } = useTournamentStore();

    useEffect(() => {
        if (params.id) {
            getTournament(params.id);
        }
    }, [params.id, getTournament]);

    if (isLoading || !activeTournament) {
        return <div className="text-white text-center py-10">Loading tournament...</div>;
    }

    return (
        <div>
            <TournamentHeader 
                tournamentId={params.id}
                title={activeTournament.title}
                status={activeTournament.status}
                game={activeTournament.game}
                event={activeTournament.event}
            />
            {children}
        </div>
    );
}
