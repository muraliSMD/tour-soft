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

    const canManage = user?.role === 'owner' || user?.role === 'admin';
    const isReferee = user?.role === 'referee';

    const tabs = [
        { name: 'Overview', href: baseUrl },
        { name: 'Matches', href: `${baseUrl}/matches` },
        // Referees only see Overview and Matches
        ...(!isReferee ? [
             { name: 'Profile', href: `${baseUrl}/profile` }, // Add Profile back if needed, or remove
             { name: 'Teams', href: `${baseUrl}/registrations` },
             { name: 'Brackets', href: `${baseUrl}/brackets` },
             { name: 'Settings', href: `${baseUrl}/settings` }
        ] : [])
    ];

    const isActive = (path) => {
        if (path === baseUrl) {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

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
                    <h1 className="text-xl sm:text-3xl font-bold text-white">{title}</h1>
                </div>
                {user?.role !== 'referee' && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => router.push(`${baseUrl}/settings`)}
                            className="flex-1 sm:flex-none justify-center"
                        >
                            Edit
                        </Button>
                        
                        {status === 'Draft' && (
                            <Button 
                                size="sm"
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none justify-center"
                            >
                                {isLoading ? 'Starting...' : 'Start'}
                            </Button>
                        )}

                        {status === 'Active' && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button 
                                    size="sm"
                                    variant="danger"
                                    onClick={() => setIsResetConfirmOpen(true)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                >
                                    Reset
                                </Button>
                                <Button 
                                    size="sm"
                                    onClick={() => setIsCompleteConfirmOpen(true)}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    End
                                </Button>
                            </div>
                        )}

                         {status === 'Completed' && (
                            <Button 
                                size="sm"
                                variant="secondary"
                                onClick={() => setIsResetConfirmOpen(true)}
                                disabled={isLoading}
                                className="flex-1 sm:flex-none justify-center"
                            >
                                Re-Open
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="relative border-b border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar -mb-px">
                    {tabs.map((tab) => (
                        <Link 
                            key={tab.name} 
                            href={tab.href}
                            className={`
                                pb-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0
                                ${isActive(tab.href) 
                                    ? 'border-primary text-white' 
                                    : 'border-transparent text-text-muted hover:text-white hover:border-white/10'}
                            `}
                        >
                            {tab.name}
                        </Link>
                    ))}
                </div>
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
