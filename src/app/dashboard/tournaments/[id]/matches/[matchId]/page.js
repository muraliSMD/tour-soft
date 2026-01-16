"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMatchStore from '@/store/useMatchStore';
import useAuthStore from '@/store/useAuthStore';

export default function MatchDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { activeMatch, getMatch, updateMatchStatus, updateScore, undoScore, isLoading } = useMatchStore();

    useEffect(() => {
        if (params.matchId) {
            getMatch(params.matchId);
        }
    }, [params.matchId, getMatch]);

    if (isLoading || !activeMatch) {
        return <div className="text-white text-center py-10">Loading match details...</div>;
    }

    const { team1, team2, matchNumber, status, winner, targetScore, referee } = activeMatch;

    const getStatusColor = (s) => {
        switch (s) {
            case 'completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'in-progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        }
    };

    const canManage = user?.role === 'owner' || user?.role === 'admin' || user?.role === 'referee';

    const handleStatusChange = async (e) => {
        try {
            await updateMatchStatus(activeMatch._id, e.target.value);
        } catch (error) {
            console.error(error);
        }
    };

    const handleScoreUpdate = async (team) => {
        try {
            await updateScore(activeMatch._id, team);
        } catch (error) {
            console.error('Failed to update score:', error);
        }
    };

    const handleUndo = async () => {
        try {
            await undoScore(activeMatch._id);
        } catch (error) {
            console.error('Failed to undo score:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
                        ← Back to Matches
                    </Button>
                    <h1 className="text-2xl font-bold text-white">Match #{matchNumber} Details</h1>
                </div>
                {canManage && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted">Status:</span>
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border focus:outline-none cursor-pointer ${getStatusColor(status)}`}
                        >
                            <option value="pending" className="bg-surface text-yellow-500">Pending</option>
                            <option value="in-progress" className="bg-surface text-blue-500">In Progress</option>
                            <option value="completed" className="bg-surface text-green-500">Completed</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Scoreboard */}
            <Card className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 text-center">
                    
                    {/* Team 1 */}
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{team1.name}</h2>
                        <div className={`text-6xl font-bold ${winner === 'team1' ? 'text-green-500' : 'text-primary'}`}>
                            {team1.score}
                        </div>
                        {canManage && status !== 'completed' && (
                            <Button 
                                size="sm" 
                                className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleScoreUpdate('team1')}
                            >
                                +1 Point
                            </Button>
                        )}
                        {winner === 'team1' && <div className="mt-2 text-green-400 text-sm font-medium">WINNER</div>}
                    </div>

                    {/* VS / Info */}
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-4xl font-light text-text-muted">VS</span>
                        <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-text-muted">
                            Target: {targetScore}
                        </div>
                         {!canManage && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                {status}
                            </span>
                        )}
                        
                        {canManage && status !== 'completed' && (
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={handleUndo}
                                className="mt-2"
                                disabled={activeMatch.scoreHistory?.length === 0}
                            >
                                Undo Last
                            </Button>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{team2.name}</h2>
                        <div className={`text-6xl font-bold ${winner === 'team2' ? 'text-green-500' : 'text-primary'}`}>
                            {team2.score}
                        </div>
                         {canManage && status !== 'completed' && (
                            <Button 
                                size="sm" 
                                className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => handleScoreUpdate('team2')}
                            >
                                +1 Point
                            </Button>
                        )}
                        {winner === 'team2' && <div className="mt-2 text-green-400 text-sm font-medium">WINNER</div>}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Match Info</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-white/5">
                             <span className="text-text-muted">Referee</span>
                             <span className="text-white">{referee?.name || 'Not assigned'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                             <span className="text-text-muted">Format</span>
                             <span className="text-white">Single Match</span>
                        </div>
                         {/* Placeholder for more info like logs or court number */}
                    </div>
                </Card>
                
                 {/*  Logs / Events placeholder */}
                 <Card className="p-6 h-full flex flex-col justify-center items-center text-center">
                    <p className="text-text-muted">Match logs and events will appear here.</p>
                 </Card>
            </div>
        </div>
    );
}
