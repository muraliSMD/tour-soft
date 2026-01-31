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

const GroupStageViewer = ({ matches }) => {
    // Group matches by "group" field (e.g., "Group A", "Group B")
    const groups = matches.reduce((acc, match) => {
        const groupName = match.group || 'Unknown Group';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(match);
        return acc;
    }, {});

    // Sort groups alphabetically
    const sortedGroupNames = Object.keys(groups).sort();

    return (
        <div className="space-y-12">
            {sortedGroupNames.map(groupName => (
                <div key={groupName} className="bg-surface p-6 rounded-xl border border-white/5 shadow-sm">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">{groupName}</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Standings Table */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Standings</h4>
                            <GroupStandings matches={groups[groupName]} />
                        </div>

                        {/* Match List */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Matches</h4>
                            <div className="flex flex-col gap-3">
                                {groups[groupName].map(match => (
                                    <MatchNode key={match._id} match={match} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper to calculate and render standings
const GroupStandings = ({ matches }) => {
    const stats = {};

    // Initialize logic
    matches.forEach(match => {
        // Ensure teams exist in stats
        [match.team1, match.team2].forEach(team => {
            if (!stats[team.name]) {
                stats[team.name] = { name: team.name, played: 0, won: 0, lost: 0, points: 0 };
            }
        });

        // Calculate stats if match is completed
        if (match.status === 'completed' && match.winner) {
            const winnerName = match.winner === 'team1' ? match.team1.name : match.team2.name;
            const loserName = match.winner === 'team1' ? match.team2.name : match.team1.name;

            // Winner stats
            stats[winnerName].played += 1;
            stats[winnerName].won += 1;
            stats[winnerName].points += 2; // Assumption: 2 pts for win

            // Loser stats
            stats[loserName].played += 1;
            stats[loserName].lost += 1;
        }
    });

    const standings = Object.values(stats).sort((a, b) => b.points - a.points || b.won - a.won);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-white/5">
                    <tr>
                        <th className="px-3 py-2 rounded-tl-lg">Team</th>
                        <th className="px-3 py-2 text-center">P</th>
                        <th className="px-3 py-2 text-center">W</th>
                        <th className="px-3 py-2 text-center">L</th>
                        <th className="px-3 py-2 text-center rounded-tr-lg">Pts</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {standings.map((team, idx) => (
                        <tr key={team.name} className={idx % 2 === 0 ? 'bg-white/0' : 'bg-white/[0.02]'}>
                            <td className="px-3 py-2 font-medium text-white">{team.name}</td>
                            <td className="px-3 py-2 text-center text-text-muted">{team.played}</td>
                            <td className="px-3 py-2 text-center text-green-400">{team.won}</td>
                            <td className="px-3 py-2 text-center text-red-400">{team.lost}</td>
                            <td className="px-3 py-2 text-center font-bold text-primary">{team.points}</td>
                        </tr>
                    ))}
                    {standings.length === 0 && (
                        <tr><td colSpan="5" className="text-center p-4 text-text-muted">No participants yet</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const BracketViewer = ({ matches = [], format }) => {
    if (!matches || matches.length === 0) {
        return <div className="text-text-muted text-center p-8">No matches generated yet.</div>;
    }

    // Determine mode based on first match type OR Tournament Format
    // Format string usually contains "League" or "Round Robin"
    const isLeague = 
        matches[0]?.type === 'League' || 
        (format && (format.includes('League') || format.includes('Round Robin')));

    if (isLeague) {
        return <GroupStageViewer matches={matches} />;
    }

    // Default Knockout View
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
