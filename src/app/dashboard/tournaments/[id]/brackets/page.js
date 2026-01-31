"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BracketViewer from '@/components/tournament/BracketViewer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import useAuthStore from '@/store/useAuthStore';
import useTournamentStore from '@/store/useTournamentStore';
import api from '@/lib/axios';

export default function BracketsPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const { getTournament, activeTournament } = useTournamentStore();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const fetchMatches = async () => {
        try {
            // Add timestamp to prevent caching
            const response = await api.get(`/matches/tournament/${params.id}?t=${Date.now()}`);
            setMatches(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch matches", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchMatches();
        }
    }, [params.id]);

    const confirmGenerate = async () => {
        try {
            await api.post(`/tournaments/${params.id}/start`);
            alert("Bracket generated successfully!");
            setConfirmModalOpen(false);
            fetchMatches(); // Refresh
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to generate bracket");
        }
    };

    const handleGeneratePlayoffs = async () => {
        if (!confirm("Are you sure you want to generate Semi-Finals? Ensure all group matches are scored.")) return;
        try {
            await api.post(`/tournaments/${params.id}/generate-playoffs`);
            alert("Semi-Finals generated successfully!");
            fetchMatches();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to generate playoffs");
        }
    };

    const canManage = user?.role === 'owner' || user?.role === 'admin';
    
    // Determine Stage
    const hasLeague = matches.some(m => m.type === 'League');
    const hasSemis = matches.some(m => m.round === 2);
    const hasFinal = matches.some(m => m.round === 3);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Brackets</h2>
                {canManage && (
                    <div className="flex gap-2">
                        {hasLeague && !hasFinal && (
                             <Button onClick={handleGeneratePlayoffs} variant="primary" size="sm">
                                {hasSemis ? "Generate Final" : "Generate Playoffs (Semi-Finals)"}
                            </Button>
                        )}
                        <Button onClick={() => setConfirmModalOpen(true)} variant="secondary" size="sm">
                            Restart / Re-Shuffle
                        </Button>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmGenerate}
                title="Start Tournament"
                message="Are you sure? This will clear existing matches and generate a new bracket based on participants."
                confirmText="Generate Bracket"
            />
            
            <Card className="p-8 bg-surface-highlight/20 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="text-center text-text-muted">Loading bracket...</div>
                ) : (
                    <BracketViewer matches={matches} format={activeTournament?.format} />
                )}
            </Card>
        </div>
    );
}
