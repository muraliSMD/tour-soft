'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, Users, Trophy, MapPin } from 'lucide-react';
import api from '@/lib/axios';
import Loader from '@/components/ui/Loader';
import Card from '@/components/ui/Card';
import AcademyProfileView from '@/components/academy/AcademyProfileView';

export default function TournamentProfilePage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                // We use the public endpoint or the dashboard one? 
                // Using the specific ID endpoint which should give us details
                const res = await api.get(`/tournaments/${id}`);
                if (res.data.success) {
                    setTournament(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTournament();
    }, [id]);

    if (loading) return <Loader fullScreen text="Loading Tournament Profile..." />;
    if (!tournament) return <div>Tournament not found</div>;

    // Check if tournament has an academy
    if (!tournament.academy) {
        return (
             <div className="p-12 text-center bg-surface border border-white/5 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-2">Independent Tournament</h3>
                <p className="text-text-muted">This tournament is not linked to any specific academy.</p>
             </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-semibold text-white">Organizing Academy</h2>
            </div>
            
            <AcademyProfileView academy={tournament.academy} />
        </div>
    );
}
