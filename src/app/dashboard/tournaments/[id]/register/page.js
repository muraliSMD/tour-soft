"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useRegistrationStore from '@/store/useRegistrationStore';
import useAuthStore from '@/store/useAuthStore';
import useTournamentStore from '@/store/useTournamentStore';

export default function TournamentRegisterPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { activeTournament } = useTournamentStore();
    const { registerTeam, isLoading, message, isError } = useRegistrationStore();
    
    const [formData, setFormData] = useState({
        teamName: '',
        paymentAmount: 500, // Default registration fee
        teamMembers: [
            { name: '', email: '', phone: '' },
            { name: '', email: '', phone: '' }
        ]
    });

    const addTeamMember = () => {
        setFormData({
            ...formData,
            teamMembers: [...formData.teamMembers, { name: '', email: '', phone: '' }]
        });
    };

    const removeTeamMember = (index) => {
        setFormData({
            ...formData,
            teamMembers: formData.teamMembers.filter((_, i) => i !== index)
        });
    };

    const updateTeamMember = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerTeam(params.id, formData);
            alert('Registration submitted successfully! Awaiting admin approval.');
            router.push('/dashboard/tournaments');
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Register Your Team</h2>
                <p className="text-text-muted">
                    Register for {activeTournament?.title || 'this tournament'}
                </p>
            </div>

            {isError && (
                <Card className="p-4 bg-red-500/10 border-red-500/20">
                    <p className="text-red-500">{message}</p>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Team Details</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">
                                Team Name *
                            </label>
                            <input
                                type="text"
                                value={formData.teamName}
                                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                required
                                placeholder="Enter your team name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1.5">
                                Registration Fee
                            </label>
                            <input
                                type="number"
                                value={formData.paymentAmount}
                                onChange={(e) => setFormData({ ...formData, paymentAmount: parseInt(e.target.value) })}
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2.5 text-white"
                                required
                            />
                            <p className="text-xs text-text-muted mt-1">
                                Amount in your local currency
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Team Members</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={addTeamMember}>
                            + Add Member
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {formData.teamMembers.map((member, index) => (
                            <div key={index} className="p-4 bg-surface-highlight rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium text-white">Member {index + 1}</h4>
                                    {index > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(index)}
                                            className="text-red-500 text-sm hover:text-red-400"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={member.name}
                                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                        placeholder="Name *"
                                        className="bg-surface border border-white/10 rounded px-3 py-2 text-white text-sm"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={member.email}
                                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                        placeholder="Email"
                                        className="bg-surface border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="tel"
                                        value={member.phone}
                                        onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                                        placeholder="Phone"
                                        className="bg-surface border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-lg font-semibold text-white mb-2">Next Steps</h3>
                    <ul className="text-text-muted text-sm space-y-1">
                        <li>1. Submit your registration</li>
                        <li>2. Wait for admin approval</li>
                        <li>3. Complete payment (manual or online)</li>
                        <li>4. You're all set!</li>
                    </ul>
                </Card>

                <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1">
                        {isLoading ? 'Submitting...' : 'Submit Registration'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
