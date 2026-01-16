"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMatchStore from '@/store/useMatchStore';
import useAuthStore from '@/store/useAuthStore';

export default function MatchScoringPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { activeMatch, getMatch, updateScore, undoScore, isLoading } = useMatchStore();

    useEffect(() => {
        if (params.id) {
            getMatch(params.id);
        }
    }, [params.id]);

    const handleScorePoint = async (team) => {
        try {
            await updateScore(params.id, team);
        } catch (error) {
            console.error('Error updating score:', error);
        }
    };

    const handleUndo = async () => {
        try {
            await undoScore(params.id);
        } catch (error) {
            console.error('Error undoing score:', error);
        }
    };

    if (isLoading || !activeMatch) {
        return <div className="text-white text-center py-10">Loading match...</div>;
    }

    const isMatchCompleted = activeMatch.status === 'completed';
    const canScore = user?.role === 'referee' || user?.role === 'owner' || user?.role === 'admin';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Match #{activeMatch.matchNumber} - Live Scoring</h2>
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
            </div>

            {isMatchCompleted && (
                <Card className="p-6 bg-green-500/10 border-green-500/20">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-green-500 mb-2">Match Completed! 🏆</h3>
                        <p className="text-white text-xl">
                            Winner: {activeMatch.winner === 'team1' ? activeMatch.team1.name : activeMatch.team2.name}
                        </p>
                    </div>
                </Card>
            )}

            {/* Scoreboard */}
            <Card className="p-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Team 1 */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">{activeMatch.team1.name}</h3>
                        <div className="text-6xl font-bold text-primary mb-4">
                            {activeMatch.team1.score}
                        </div>
                        {canScore && !isMatchCompleted && (
                            <Button 
                                onClick={() => handleScorePoint('team1')}
                                className="w-full"
                                size="lg"
                            >
                                +1 Point
                            </Button>
                        )}
                    </div>

                    {/* VS Separator */}
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-text-muted text-xl mb-2">vs</span>
                        <div className="text-center">
                            <p className="text-sm text-text-muted">Target</p>
                            <p className="text-2xl font-bold text-white">{activeMatch.targetScore}</p>
                        </div>
                        {canScore && !isMatchCompleted && activeMatch.scoreHistory?.length > 0 && (
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={handleUndo}
                                className="mt-4"
                            >
                                ↶ Undo Last Point
                            </Button>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">{activeMatch.team2.name}</h3>
                        <div className="text-6xl font-bold text-primary mb-4">
                            {activeMatch.team2.score}
                        </div>
                        {canScore && !isMatchCompleted && (
                            <Button 
                                onClick={() => handleScorePoint('team2')}
                                className="w-full"
                                size="lg"
                            >
                                +1 Point
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Score History */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Score History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeMatch.scoreHistory && activeMatch.scoreHistory.length > 0 ? (
                        [...activeMatch.scoreHistory].reverse().map((entry, index) => (
                            <div 
                                key={index} 
                                className="flex justify-between items-center p-3 bg-surface-highlight rounded-lg"
                            >
                                <span className="text-white">
                                    {entry.team === 'team1' ? activeMatch.team1.name : activeMatch.team2.name} scored
                                </span>
                                <div className="text-right">
                                    <span className="text-primary font-bold">{entry.score}</span>
                                    <span className="text-text-muted text-xs ml-2">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-muted text-center py-4">No points scored yet</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
