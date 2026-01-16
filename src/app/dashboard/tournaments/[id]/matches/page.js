"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMatchStore from '@/store/useMatchStore';
import useAuthStore from '@/store/useAuthStore';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

export default function TournamentMatchesPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const { matches, getTournamentMatches, createMatch, assignReferee, deleteMatch, updateMatchStatus, isLoading } = useMatchStore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        matchNumber: 1,
        team1: '',
        team2: '',
        targetScore: 20
    });
    
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const [referees, setReferees] = useState([]);
    const [registeredTeams, setRegisteredTeams] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (params.id) {
                getTournamentMatches(params.id);
                
                try {
                    const { default: api } = await import('@/lib/axios');
                    
                    // Fetch Registrations (Teams)
                    const regResponse = await api.get(`/registrations/tournament/${params.id}`);
                    // Extract unique team names or objects. Assuming registration has teamName.
                    // Filter out rejected ones if needed, or pending. 
                    // Let's assume accepted/approved registrations are valid teams.
                    // But for manual match creation, maybe we want all? Let's show all or approved.
                    // Let's show all for now or filter by status 'approved' if you prefer.
                    // Based on requirements, just "participants".
                    setRegisteredTeams(regResponse.data);

                    // Fetch Referees
                    if (user?.role === 'owner' || user?.role === 'admin') {
                        const userResponse = await api.get('/users');
                        const refs = userResponse.data.filter(u => u.role === 'referee');
                        setReferees(refs);
                    }
                } catch (error) {
                    console.error("Failed to fetch data", error);
                }
            }
        };
        
        fetchData();
    }, [params.id, getTournamentMatches, user]);

    const canManageMatches = user?.role === 'owner' || user?.role === 'admin';
    const isReferee = user?.role === 'referee';

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        try {
            await createMatch({
                tournament: params.id,
                ...formData
            });
            setShowCreateForm(false);
            setFormData({ matchNumber: matches.length + 2, team1: '', team2: '', targetScore: 20 });
        } catch (error) {
            console.error('Error creating match:', error);
        }
    };

    const handleAssignReferee = async (matchId, refereeId) => {
        try {
            await assignReferee(matchId, refereeId);
        } catch (error) {
            console.error('Error assigning referee:', error);
        }
    };

    const handleDeleteClick = (matchId) => {
        setDeleteModal({ isOpen: true, id: matchId });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteMatch(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error('Error deleting match:', error);
            alert('Failed to delete match');
        }
    };

    const handleUpdateStatus = async (matchId, status) => {
        try {
            await updateMatchStatus(matchId, status);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Matches</h2>
                    <p className="text-text-muted">Manage tournament matches</p>
                </div>
                {canManageMatches && (
                    <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                        {showCreateForm ? 'Cancel' : '+ Create Match'}
                    </Button>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Match"
                message="Are you sure you want to delete this match? This action cannot be undone."
            />

            {showCreateForm && canManageMatches && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Match</h3>
                    <form onSubmit={handleCreateMatch} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Match Number</label>
                                <input
                                    type="number"
                                    value={formData.matchNumber}
                                    onChange={(e) => setFormData({ ...formData, matchNumber: parseInt(e.target.value) })}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Target Score</label>
                                <input
                                    type="number"
                                    value={formData.targetScore}
                                    onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value) })}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Team 1</label>
                                <select
                                    value={formData.team1}
                                    onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="">Select Team 1</option>
                                    {registeredTeams.map((reg) => (
                                        <option key={reg._id} value={reg.teamName}>
                                            {reg.teamName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Team 2</label>
                                <select
                                    value={formData.team2}
                                    onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                    required
                                >
                                    <option value="">Select Team 2</option>
                                    {registeredTeams.map((reg) => (
                                        <option key={reg._id} value={reg.teamName}>
                                            {reg.teamName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button type="submit">Create Match</Button>
                    </form>
                </Card>
            )}

            <div className="grid gap-4">
                {isLoading && <div className="text-white text-center py-10">Loading matches...</div>}
                {!isLoading && matches.length === 0 && (
                    <Card className="p-8 text-center">
                        <p className="text-text-muted">No matches created yet</p>
                    </Card>
                )}
                {matches.map((match) => (
                    <Card key={match._id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Match #{match.matchNumber}
                                </h3>
                                <div className="flex gap-8 text-sm">
                                    <div>
                                        <p className="text-text-muted">Team 1</p>
                                        <p className="text-white font-medium">{match.team1.name}</p>
                                        <p className="text-primary text-xl font-bold">{match.team1.score}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-text-muted">vs</span>
                                    </div>
                                    <div>
                                        <p className="text-text-muted">Team 2</p>
                                        <p className="text-white font-medium">{match.team2.name}</p>
                                        <p className="text-primary text-xl font-bold">{match.team2.score}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                {canManageMatches || isReferee ? (
                                    <select
                                        value={match.status}
                                        onChange={(e) => handleUpdateStatus(match._id, e.target.value)}
                                        className={`px-3 py-1 rounded text-xs font-medium border focus:outline-none cursor-pointer ${
                                            match.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            match.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}
                                    >
                                        <option value="pending" className="bg-surface text-yellow-500">Pending</option>
                                        <option value="in-progress" className="bg-surface text-blue-500">In Progress</option>
                                        <option value="completed" className="bg-surface text-green-500">Completed</option>
                                    </select>
                                ) : (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        match.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                        match.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {match.status}
                                    </span>
                                )}
                                
                                {match.winner && (
                                    <p className="text-green-500 text-sm mt-2">
                                        Winner: {match.winner === 'team1' ? match.team1.name : match.team2.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <div className="text-sm text-text-muted flex items-center gap-4">
                                <div>
                                    <span className="mr-2">Referee:</span>
                                    {canManageMatches ? (
                                        <select
                                            value={match.referee?._id || ''}
                                            onChange={(e) => handleAssignReferee(match._id, e.target.value)}
                                            className="bg-surface border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="">Select Referee</option>
                                            {referees.map(ref => (
                                                <option key={ref._id} value={ref._id}>
                                                    {ref.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span>{match.referee?.name || 'Not assigned'}</span>
                                    )}
                                </div>
                                <p>Target: {match.targetScore} points</p>
                            </div>
                            <div className="flex gap-2">
                                {canManageMatches && (
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteClick(match._id)}>
                                        Delete
                                    </Button>
                                )}
                                {match.referee && match.referee._id === user?._id && (
                                    <Link href={`/dashboard/tournaments/${params.id}/matches/${match._id}/score`}>
                                        <Button size="sm">Score Match</Button>
                                    </Link>
                                )}
                                {match.status !== 'completed' && (
                                    <Link href={`/dashboard/tournaments/${params.id}/matches/${match._id}`}>
                                        <Button variant="secondary" size="sm">View Details</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
