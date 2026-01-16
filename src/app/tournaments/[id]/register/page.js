"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/store/useAuthStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const TournamentRegistrationPage = () => {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuthStore();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form State
    const [teamName, setTeamName] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [format, setFormat] = useState('Single'); // Default, will update from tournament
    
    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const response = await api.get(`/tournaments/${params.id}`);
                setTournament(response.data);
                
                // Attempt to detect format from tournament data
                if (response.data.format && response.data.format.toLowerCase().includes('double')) {
                    setFormat('Double');
                } else {
                    setFormat('Single');
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch tournament", err);
                setError("Tournament not found or failed to load.");
                setLoading(false);
            }
        };

        if (params.id) {
            fetchTournament();
        }
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            router.push(`/login?redirect=/tournaments/${params.id}/register`);
            return;
        }

        try {
            const registrationData = {
                teamName: format === 'Single' ? user.name : teamName,
                paymentAmount: 0, // dynamic later?
                teamMembers: [
                    { name: user.name, email: user.email }
                ]
            };

            if (format === 'Double') {
                 if (!teamName) {
                    alert("Team Name is required for Doubles");
                    return;
                 }
                 if (!partnerName) {
                    alert("Partner Name is required for Doubles");
                    return;
                 }
                 registrationData.teamMembers.push({ name: partnerName });
            }

            await api.post(`/registrations/tournament/${params.id}/register`, registrationData);
            
            alert('Registration successful!');
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    if (loading || authLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading...</div>;
    
    if (error) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="p-8 text-center max-w-md w-full">
                <h2 className="text-xl text-red-500 mb-4">Error</h2>
                <p className="text-text-muted mb-6">{error}</p>
                <Link href="/">
                    <Button variant="secondary">Go Home</Button>
                </Link>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{tournament.title}</h1>
                    <p className="text-text-muted">Registration</p>
                </div>

                <Card className="p-8">
                    {!user ? (
                        <div className="text-center space-y-6">
                            <p className="text-text-muted">You must be logged in to register for this tournament.</p>
                            <div className="flex flex-col gap-3">
                                <Link href={`/login?redirect=/tournaments/${params.id}/register`} className="w-full">
                                    <Button className="w-full">Login</Button>
                                </Link>
                                <Link href="/signup" className="w-full">
                                    <Button variant="secondary" className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User Info (Read Only) */}
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Your Name</label>
                                <input
                                    type="text"
                                    value={user.name}
                                    disabled
                                    className="w-full bg-surface/50 border border-white/5 rounded-lg px-4 py-2 text-text-muted cursor-not-allowed"
                                />
                            </div>

                            {/* Format Specific Inputs */}
                            {format === 'Double' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Team Name</label>
                                        <input
                                            type="text"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                                            placeholder="Enter Team Name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Partner Name</label>
                                        <input
                                            type="text"
                                            value={partnerName}
                                            onChange={(e) => setPartnerName(e.target.value)}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                                            placeholder="Enter Partner Name"
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 bg-primary/10 rounded-lg text-primary text-sm">
                                    Registering as a Single Player. Your name will be used as the entrant name.
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                {format === 'Double' ? 'Register Team' : 'Register Now'}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default TournamentRegistrationPage;
