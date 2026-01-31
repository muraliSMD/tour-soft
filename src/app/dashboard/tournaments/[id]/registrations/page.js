"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import useRegistrationStore from '@/store/useRegistrationStore';
import useAuthStore from '@/store/useAuthStore';

export default function RegistrationsManagementPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const { 
        registrations, 
        getTournamentRegistrations, 
        approveRegistration,
        rejectRegistration,
        deleteRegistration,
        markAsPaid,
        isLoading 
    } = useRegistrationStore();

    const [paymentNotes, setPaymentNotes] = useState({});
    const [selectedReg, setSelectedReg] = useState(null);
    const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null, name: '' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

    useEffect(() => {
        if (params.id) {
            getTournamentRegistrations(params.id);
        }
    }, [params.id, getTournamentRegistrations]);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '',
        player1: '',
        player2: '',
        phone: '',
        city: ''
    });

    const canManage = user?.role === 'owner' || user?.role === 'admin';

    // Manual Registration Handler
    const handleAddTeam = async (e) => {
        e.preventDefault();
        try {
            // Need api instance. Since it's not imported at top of file like in participants page, we might need to import it or use a store action if available.
            // checking imports... 'api' is not imported. I should import it or use store.
            // store actions often wrap api. useRegistrationStore might not have manualRegister.
            // I'll import api at the top.
            const { default: api } = await import('@/lib/axios');
            
            const payload = {
                teamName: formData.teamName,
                teamMembers: [
                    { name: formData.player1, phone: formData.phone }
                ],
                city: formData.city
            };
            
            if (formData.player2) {
                 payload.teamMembers.push({ name: formData.player2, phone: formData.phone });
            }

            await api.post(`/tournaments/${params.id}/manual-register`, payload);
            
            setIsAddModalOpen(false);
            setFormData({ teamName: '', player1: '', player2: '', phone: '', city: '' });
            getTournamentRegistrations(params.id); // Refresh
            alert("Team added successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add team");
        }
    };

    const handleApprove = async (regId) => {
        try {
            await approveRegistration(regId);
            alert('Registration approved successfully!');
        } catch (error) {
            console.error('Error approving:', error);
        }
    };

    const handleRejectClick = (reg) => {
        setRejectModal({
            isOpen: true,
            id: reg._id,
            name: reg.teamName
        });
    };

    const confirmReject = async () => {
        if (!rejectModal.id) return;
        try {
            await rejectRegistration(rejectModal.id);
            setRejectModal({ isOpen: false, id: null, name: '' });
            alert('Registration rejected.');
        } catch (error) {
            console.error('Error rejecting:', error);
        }
    };

    const handleDeleteClick = (reg) => {
        setDeleteModal({
            isOpen: true,
            id: reg._id,
            name: reg.teamName
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteRegistration(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null, name: '' });
            alert('Team deleted successfully.');
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete team.');
        }
    };

    const handleMarkPaid = async (regId) => {
        try {
            await markAsPaid(regId, paymentNotes[regId] || '');
            alert('Registration marked as paid!');
            setPaymentNotes({ ...paymentNotes, [regId]: '' });
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Teams</h2>
                    <p className="text-text-muted">Manage tournament teams and registrations</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                            const url = `${window.location.origin}/register/${params.id}`;
                            navigator.clipboard.writeText(url);
                            alert("Registration link copied to clipboard: " + url);
                        }}
                    >
                        Share Link
                    </Button>
                    <Button variant="secondary" size="sm">Export CSV</Button>
                    {canManage && (
                        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>+ Add Team</Button>
                    )}
                </div>
            </div>

            {isLoading && <div className="text-white text-center py-10">Loading registrations...</div>}

            {!isLoading && registrations.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-text-muted">No registrations yet</p>
                </Card>
            )}
            
            {/* Modal for Reject */}
            <DeleteConfirmationModal
                isOpen={rejectModal.isOpen}
                onClose={() => setRejectModal({ ...rejectModal, isOpen: false })}
                onConfirm={confirmReject}
                itemName={rejectModal.name}
                title="Reject Registration"
                message={`Are you sure you want to reject the registration for "${rejectModal.name}"?`}
                confirmText="Reject"
            />
            
            {/* Modal for Delete */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                itemName={deleteModal.name}
                title="Delete Team"
                message={`Are you sure you want to PERMANENTLY delete the team "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete Team"
            />

            {/* Add Team Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg p-6 relative">
                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4">Add Team</h3>
                        
                        <form onSubmit={handleAddTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Team Name</label>
                                <input
                                    type="text"
                                    value={formData.teamName}
                                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                    required
                                    placeholder="Enter Team Name"
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
                                    <label className="block text-sm font-medium text-text-muted mb-1">Player 2 Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.player2}
                                        onChange={(e) => setFormData({...formData, player2: e.target.value})}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                        placeholder="For Doubles"
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
                                <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Add Team</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="grid gap-4">
                {registrations.map((reg) => (
                    <Card key={reg._id} className="p-6">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{reg.teamName}</h3>
                                    <p className="text-text-muted text-sm">
                                        Registered by: {reg.user?.name || 'Unknown'} ({reg.user?.email})
                                    </p>
                                    <p className="text-text-muted text-sm">
                                        {new Date(reg.registrationDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.status)}`}>
                                            {reg.status}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(reg.paymentStatus)}`}>
                                            {reg.paymentStatus}
                                        </span>
                                    </div>
                                    {canManage && (
                                        <button 
                                            onClick={() => handleDeleteClick(reg)}
                                            className="text-text-muted hover:text-red-500 text-xs flex items-center gap-1 transition-colors mt-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Team
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="bg-surface-highlight p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-white mb-2">Team Members</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {reg.teamMembers?.map((member, idx) => (
                                        <div key={idx} className="text-sm text-text-muted">
                                            <span className="text-white">{member.name}</span>
                                            {member.email && ` • ${member.email}`}
                                            {member.phone && ` • ${member.phone}`}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="flex justify-between items-center p-4 bg-surface-highlight rounded-lg">
                                <div>
                                    <p className="text-sm text-text-muted">Registration Fee</p>
                                    <p className="text-2xl font-bold text-primary">₹{reg.paymentAmount}</p>
                                    {reg.paymentMethod && (
                                        <p className="text-xs text-text-muted mt-1">
                                            Method: {reg.paymentMethod} 
                                            {reg.paidBy && ` • Marked by ${reg.paidBy}`}
                                        </p>
                                    )}
                                </div>
                                {canManage && reg.paymentStatus === 'pending' && reg.status === 'approved' && (
                                    <div className="flex gap-2 items-end flex-col">
                                        <input
                                            type="text"
                                            placeholder="Payment notes (optional)"
                                            value={paymentNotes[reg._id] || ''}
                                            onChange={(e) => setPaymentNotes({ ...paymentNotes, [reg._id]: e.target.value })}
                                            className="bg-surface border border-white/10 rounded px-3 py-1.5 text-white text-sm"
                                        />
                                        <Button size="sm" onClick={() => handleMarkPaid(reg._id)}>
                                            Mark as Paid (Manual)
                                        </Button>
                                    </div>
                                )}
                                {reg.paymentStatus === 'completed' && (
                                    <div className="text-right">
                                        <p className="text-green-500 text-sm font-medium">✓ Payment Received</p>
                                        {reg.paidAt && (
                                            <p className="text-xs text-text-muted">
                                                {new Date(reg.paidAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {reg.notes && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                                    <p className="text-sm text-blue-400">
                                        <strong>Notes:</strong> {reg.notes}
                                    </p>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {canManage && reg.status === 'pending' && (
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <Button size="sm" onClick={() => handleApprove(reg._id)}>
                                        ✓ Approve
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleRejectClick(reg)}>
                                        ✕ Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
