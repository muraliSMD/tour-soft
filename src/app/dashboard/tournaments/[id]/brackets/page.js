"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BracketViewer from '@/components/tournament/BracketViewer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';

export default function BracketsPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const fetchMatches = async () => {
        try {
            const response = await api.get(`/matches/tournament/${params.id}`);
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

    const canManage = user?.role === 'owner' || user?.role === 'admin';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Brackets</h2>
                {canManage && (
                    <Button onClick={() => setConfirmModalOpen(true)} variant="secondary" size="sm">
                        Recursive / Start Tournament
                    </Button>
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
                    <BracketViewer matches={matches} />
                )}
            </Card>
        </div>
    );
}
