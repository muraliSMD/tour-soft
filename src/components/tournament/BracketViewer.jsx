"use client";

import React from 'react';

const MatchNode = ({ match }) => {
    return (
        <div className="w-64 bg-surface border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-lg relative z-10">
            <div className="flex justify-between items-center px-3 py-1 bg-white/5 border-b border-white/5">
                <span className="text-xs text-text-muted font-medium">Match {match.matchNumber}</span>
                <span className="text-xs text-text-muted">{match.status}</span>
            </div>
            
            {/* Team A */}
            <div className={`flex justify-between items-center px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer ${match.winner === 'team1' ? 'bg-green-500/10' : match.winner === 'team2' ? 'bg-red-500/10' : ''}`}>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${match.winner === 'team1' ? 'text-green-500' : 'text-white'}`}>
                        {match.team1.name}
                    </span>
                </div>
                <span className="font-mono text-sm text-white">{match.team1.score}</span>
            </div>

            <div className="h-[1px] bg-white/5 w-full"></div>

            {/* Team B */}
            <div className={`flex justify-between items-center px-4 py-2 hover:bg-white/5 transition-colors cursor-pointer ${match.winner === 'team2' ? 'bg-green-500/10' : match.winner === 'team1' ? 'bg-red-500/10' : ''}`}>
                 <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${match.winner === 'team2' ? 'text-green-500' : 'text-white'}`}>
                        {match.team2.name}
                    </span>
                </div>
                <span className="font-mono text-sm text-white">{match.team2.score}</span>
            </div>
        </div>
    );
};

const BracketViewer = ({ matches = [] }) => {
    // Simple mock logic to group by rounds if 'round' field existed, 
    // or just showing them in a flex wrap for now since current backend only generates Round 1
    
    // If we had round info:
    // const rounds = matches.reduce ...
    
    // For now, let's just show the active matches in a list/grid
    if (!matches || matches.length === 0) {
        return <div className="text-text-muted text-center p-8">No matches generated yet.</div>;
    }

    return (
        <div className="overflow-x-auto pb-8">
            <div className="flex flex-wrap gap-8 justify-center">
                {matches.map((match) => (
                    <MatchNode key={match._id} match={match} />
                ))}
            </div>
        </div>
    );
};

export default BracketViewer;
