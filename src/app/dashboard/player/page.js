"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';

export default function PlayerDashboardPage() {
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const { default: api } = await import('@/lib/axios');
                const res = await api.get('/player/registrations');
                setRegistrations(res.data);
            } catch (error) {
                console.error("Failed to load registrations", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        }
    };

    if (isLoading) return <Loader text="Loading your tournaments..." />;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">My Tournaments</h2>
                <p className="text-text-muted">Track your registered tournaments and matches.</p>
            </div>

            {registrations.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-text-muted mb-4">You haven't registered for any tournaments yet.</p>
                    <Link href="/">
                        <Button>Browse Tournaments</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {registrations.map((reg) => (
                        <Link key={reg._id} href={`/dashboard/player/${reg.tournament?._id}`}>
                            <Card className="p-6 hover:border-primary/50 transition-all cursor-pointer group">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                                            {reg.tournament?.title || 'Unknown Tournament'}
                                        </h3>
                                        <div className="flex gap-2 text-sm text-text-muted mt-1">
                                            <span>{reg.tournament?.game}</span>
                                            <span>•</span>
                                            <span>{reg.tournament?.startDate ? new Date(reg.tournament.startDate).toLocaleDateString() : 'Date TBA'}</span>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <span className="text-text-muted">Team: </span>
                                            <span className="text-white font-medium">{reg.teamName}</span>
                                            {/* <span className="text-xs text-text-muted ml-2">(ID: {reg._id.slice(-6)})</span> */}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reg.status)}`}>
                                                {reg.status.toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                                reg.paymentStatus === 'completed' 
                                                    ? 'text-green-500 bg-green-500/10 border-green-500/20' 
                                                    : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                                            }`}>
                                                {reg.paymentStatus === 'completed' ? 'PAID' : 'PAYMENT PENDING'}
                                            </span>
                                        </div>

                                        {reg.paymentStatus !== 'completed' && reg.status !== 'rejected' && (
                                            <Button size="sm" className="w-full md:w-auto" onClick={(e) => {
                                                e.preventDefault(); // Prevent navigation
                                                // Handle payment logic here or generic alert for now
                                                alert("Payment integration coming soon!"); 
                                            }}>
                                                Pay Now (₹{reg.paymentAmount})
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
