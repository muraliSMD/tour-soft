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
    const { startTournament, isLoading } = useTournamentStore();
    const baseUrl = `/dashboard/tournaments/${tournamentId}`;
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    const alTabs = [
        { name: 'Overview', href: baseUrl, roles: ['owner', 'admin'] },
        { name: 'Participants', href: `${baseUrl}/participants`, roles: ['owner', 'admin'] },
        { name: 'Matches', href: `${baseUrl}/matches`, roles: ['owner', 'admin', 'referee'] },
        { name: 'Registrations', href: `${baseUrl}/registrations`, roles: ['owner', 'admin'] },
        { name: 'Brackets', href: `${baseUrl}/brackets`, roles: ['owner', 'admin', 'referee'] },
        { name: 'Settings', href: `${baseUrl}/settings`, roles: ['owner', 'admin'] },
    ];

    const tabs = alTabs.filter(tab => tab.roles.includes(user?.role || ''));

    const isActive = (path) => pathname === path;

    const handleConfirmStart = async () => {
        try {
            await startTournament(tournamentId);
            setIsConfirmOpen(false);
            // Status update handled by store, page might need refresh or store sync handles it
        } catch (error) {
            alert('Failed to start tournament: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="bg-surface border-b border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 uppercase tracking-wide">
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
        </div>
    );
};

export default TournamentHeader;
