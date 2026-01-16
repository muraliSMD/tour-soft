"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/useAuthStore';
import useTournamentStore from '@/store/useTournamentStore';

export default function TournamentSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { deleteTournament } = useTournamentStore();
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteTournament(params.id);
            alert("Tournament deleted successfully");
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to delete tournament", error);
            alert(error.response?.data?.message || "Failed to delete tournament");
            setShowDeleteModal(false);
        }
    };

    const canManage = user?.role === 'owner' || user?.role === 'admin';

    if (!canManage) {
        return <div className="text-center text-text-muted py-10">You do not have permission to view this page.</div>;
    }

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
                <p className="text-text-muted">Manage tournament configuration</p>
            </div>

            <Card className="p-6 border-red-500/20 bg-red-500/5">
                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-text-muted mb-4 text-sm">
                    Deleting a tournament is permanent and cannot be undone. All matches, participants, and stats associated with this tournament will be removed.
                </p>
                <Button variant="danger" onClick={handleDeleteClick}>
                    Delete Tournament
                </Button>
            </Card>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 border-red-500/30">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Tournament?</h3>
                        <p className="text-text-muted mb-6">
                            Are you sure you want to delete this tournament? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmDelete}>
                                Yes, Delete
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
