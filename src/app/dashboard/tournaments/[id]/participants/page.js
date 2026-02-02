"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import api from '@/lib/axios';
import { useParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

export default function ParticipantsPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [participants, setParticipants] = useState([]);
    const [tournament, setTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    
    // Form State
    const [formData, setFormData] = useState({
        teamName: '',
        player1: '',
        player2: '',
        phone: '',
        city: ''
    });

    const fetchParticipants = async () => {
        if (!params.id) return;
        try {
            const response = await api.get(`/registrations/tournament/${params.id}`);
            setParticipants(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch participants", error);
            setIsLoading(false);
        }
    };

    const fetchTournament = async () => {
        try {
             const response = await api.get(`/tournaments/${params.id}`);
             setTournament(response.data);
        } catch (error) {
            console.error("Failed to fetch tournament details", error);
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchParticipants();
            fetchTournament();
        }
    }, [params.id]);

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        try {
            const isDouble = tournament?.format?.toLowerCase().includes('double') || tournament?.event?.toLowerCase().includes('double');
            
            const payload = {
                teamName: formData.teamName, // Always use provided team name
                teamMembers: [
                    // Single phone for the team/primary contact for now based on "phone number" request
                    { name: formData.player1, phone: formData.phone }
                ],
                city: formData.city
            };

            if (isDouble && formData.player2) {
                 payload.teamMembers.push({ name: formData.player2, phone: formData.phone });
            }

            await api.post(`/registrations/tournament/${params.id}/manual-register`, payload);
            
            setIsModalOpen(false);
            setFormData({ teamName: '', player1: '', player2: '', phone: '', city: '' });
            fetchParticipants(); // Refresh list
            alert("Team added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add team");
        }
    };

    const handleRemoveClick = (participant) => {
        setDeleteModal({
            isOpen: true,
            id: participant._id,
            name: participant.teamName || participant.teamMembers[0]?.name
        });
    };

    const confirmRemoveParticipant = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete(`/registrations/${deleteModal.id}`);
            setParticipants(participants.filter(p => p._id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (error) {
            console.error("Failed to remove participant", error);
            alert("Failed to remove participant");
        }
    };

    const canManage = user?.role === 'owner' || user?.role === 'admin';
    const isDouble = tournament?.format?.toLowerCase().includes('double') || tournament?.event?.toLowerCase().includes('double');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Teams ({participants.length})</h2>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm">Export CSV</Button>
                    {canManage && (
                        <Button size="sm" onClick={() => setIsModalOpen(true)}>+ Add Team</Button>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmRemoveParticipant}
                itemName={deleteModal.name}
                title="Remove Team"
                message={`Are you sure you want to remove ${deleteModal.name}? This cannot be undone.`}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg p-6 relative">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4">Add Team ({isDouble ? 'Doubles' : 'Singles'})</h3>
                        
                        <form onSubmit={handleAddParticipant} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Team Name</label>
                                <input
                                    type="text"
                                    value={formData.teamName}
                                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                    required
                                    placeholder={isDouble ? "Enter Team Name" : "Enter Participant Name"}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Player 1 Name</label>
                                    <input
                                        type="text"
                                        value={formData.player1}
                                        onChange={(e) => setFormData({...formData, player1: e.target.value})}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Player 2 Name</label>
                                    <input
                                        type="text"
                                        value={formData.player2}
                                        onChange={(e) => setFormData({...formData, player2: e.target.value})}
                                        className={`w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white ${!isDouble ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!isDouble}
                                        placeholder={!isDouble ? "Disabled (Singles)" : "Enter Player 2"}
                                        required={isDouble}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Add Team</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-surface-highlight/50">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search teams..." 
                            className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-white placeholder-text-muted focus:ring-0 focus:outline-none"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-text-muted uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Registered At</th>
                                <th className="px-6 py-4">Team Name</th>
                                <th className="px-6 py-4">Members</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-8">
                                        <Loader text="Loading teams..." />
                                    </td>
                                </tr>
                            ) : participants.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-text-muted">No teams registered yet.</td></tr>
                            ) : (
                                participants.map((p) => (
                                    <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-text-muted">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">{p.teamName}</td>
                                        <td className="px-6 py-4 text-text-muted">
                                            {p.teamMembers.map(m => m.name).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                p.status === 'approved' 
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                : p.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleRemoveClick(p)}
                                                className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-medium"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-white/5 text-center">
                    <button className="text-sm text-text-muted hover:text-white transition-colors">Load More</button>
                </div>
            </Card>
        </div>
    );
}
