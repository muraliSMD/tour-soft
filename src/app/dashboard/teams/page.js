import React from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TeamsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Teams & Players</h1>
                    <p className="text-text-muted">Manage the organizations and players in your ecosystem.</p>
                </div>
                <Button>+ Add Team</Button>
            </div>

            <Card className="p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10 bg-transparent">
                 <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4 text-text-muted">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Teams Found</h3>
                <p className="text-text-muted mb-6">Teams will appear here once they register for your tournaments.</p>
            </Card>
        </div>
    );
}
