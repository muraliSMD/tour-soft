"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import useAuthStore from '@/store/useAuthStore';
import useTournamentStore from '@/store/useTournamentStore';

const TournamentHeader = ({ tournamentId, title, status, game, event }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const { startTournament, resetTournament, updateTournament, isLoading } = useTournamentStore();
    const baseUrl = `/dashboard/tournaments/${tournamentId}`;
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    
    // New Modals
    const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);
    const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = React.useState(false);

    const alTabs = [
        { name: 'Overview', href: baseUrl, roles: ['owner', 'admin'] },
        { name: 'Teams', href: `${baseUrl}/registrations`, roles: ['owner', 'admin'] },
        { name: 'Matches', href: `${baseUrl}/matches`, roles: ['owner', 'admin', 'referee'] },
        { name: 'Brackets', href: `${baseUrl}/brackets`, roles: ['owner', 'admin', 'referee'] },
        { name: 'Settings', href: `${baseUrl}/settings`, roles: ['owner', 'admin'] },
    ];

    const tabs = alTabs.filter(tab => tab.roles.includes(user?.role || ''));

    const isActive = (path) => pathname === path;

    const handleConfirmStart = async () => {
        try {
            await startTournament(tournamentId);
            setIsConfirmOpen(false);
        } catch (error) {
            alert('Failed to start tournament: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleConfirmReset = async () => {
        try {
            await resetTournament(tournamentId);
            setIsResetConfirmOpen(false);
            window.location.reload(); // Refresh to ensure clean state view
        } catch (error) {
             alert('Failed to reset tournament: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleConfirmComplete = async () => {
        try {
             await updateTournament(tournamentId, { status: 'Completed' });
             setIsCompleteConfirmOpen(false);
        } catch (error) {
              alert('Failed to complete tournament: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="bg-surface border-b border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide
                            ${status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              status === 'Completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}
                        `}>
                            {status}
                        </span>
                        <span className="text-text-muted text-sm">{game} {event && `- ${event}`}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">{title}</h1>
                </div>
                {user?.role !== 'referee' && (
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => router.push(`${baseUrl}/settings`)}
                        >
                            Edit Details
                        </Button>
                        
                        {status === 'Draft' && (
                            <Button 
                                size="sm"
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Starting...' : 'Start Tournament'}
                            </Button>
                        )}

                        {status === 'Active' && (
                            <>
                                <Button 
                                    size="sm"
                                    variant="danger" // Or warning
                                    onClick={() => setIsResetConfirmOpen(true)}
                                    disabled={isLoading}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                >
                                    Reset
                                </Button>
                                <Button 
                                    size="sm"
                                    onClick={() => setIsCompleteConfirmOpen(true)}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    End Tournament
                                </Button>
                            </>
                        )}

                         {status === 'Completed' && (
                            <Button 
                                size="sm"
                                variant="secondary"
                                onClick={() => setIsResetConfirmOpen(true)}
                                disabled={isLoading}
                            >
                                Re-Open (Reset)
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                    <Link 
                        key={tab.name} 
                        href={tab.href}
                        className={`
                            pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                            ${isActive(tab.href) 
                                ? 'border-primary text-white' 
                                : 'border-transparent text-text-muted hover:text-white hover:border-white/10'}
                        `}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>


            <DeleteConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmStart}
                title="Start Tournament"
                message="Are you sure you want to start the tournament? This will generate matches based on current participants."
                confirmText="Start Now"
            />

            <DeleteConfirmationModal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={handleConfirmReset}
                title="Reset Tournament"
                message="Are you sure? This will DELETE ALL MATCHES and scores. The tournament will be set back to DRAFT."
                confirmText="Reset Everything"
            />

            <DeleteConfirmationModal
                isOpen={isCompleteConfirmOpen}
                onClose={() => setIsCompleteConfirmOpen(false)}
                onConfirm={handleConfirmComplete}
                title="End Tournament"
                message="Are you sure you want to mark this tournament as Completed? You can re-open it later if needed."
                confirmText="Mark as Done"
            />
        </div>
    );
};

export default TournamentHeader;
