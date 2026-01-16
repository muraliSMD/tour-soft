"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/lib/axios';

export default function AdminDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [members, setMembers] = useState([]);
    const [referees, setReferees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tournaments');

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            try {
                // Fetch Admin Details
                const userRes = await api.get(`/users/${params.id}`);
                setAdmin(userRes.data);

                // Fetch Tournaments
                const tournamentRes = await api.get(`/tournaments?user=${params.id}`);
                setTournaments(tournamentRes.data);

                // Fetch Members
                const membersRes = await api.get(`/members?user=${params.id}`);
                setMembers(membersRes.data);

                // Fetch Referees (Users created by this Admin)
                const refereesRes = await api.get(`/users?createdBy=${params.id}`);
                setReferees(refereesRes.data);
                
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id]);
    
    // Stats calculation
    const activeTournaments = tournaments.filter(t => t.status === 'Active').length;
    const totalTournaments = tournaments.length;
    const totalStudents = members.length;
    const totalReferees = referees.length;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
                <div>
                     <h1 className="text-2xl font-bold text-white">{admin?.name || 'Academy'} View</h1>
                     <p className="text-text-muted">Viewing tournaments and activities for {admin?.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Total Tournaments</div>
                    <div className="text-3xl font-bold text-white">{totalTournaments}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Total Students</div>
                    <div className="text-3xl font-bold text-white">{totalStudents}</div>
                </Card>
                <Card className="p-6">
                    <div className="text-text-muted text-sm font-medium mb-1">Total Staff</div>
                    <div className="text-3xl font-bold text-white">{totalReferees}</div>
                </Card>
                <Card className="p-6">
                     <div className="text-text-muted text-sm font-medium mb-1">Active Tournaments</div>
                     <div className="text-3xl font-bold text-white">{activeTournaments}</div>
                </Card>
            </div>

            <div className="flex gap-4 border-b border-white/10 mb-6">
                <button 
                    onClick={() => setActiveTab('tournaments')}
                    className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'tournaments' ? 'border-b-2 border-primary text-white' : 'text-text-muted hover:text-white'}`}
                >
                    Tournaments
                </button>
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'students' ? 'border-b-2 border-primary text-white' : 'text-text-muted hover:text-white'}`}
                >
                    Students ({members.length})
                </button>
                <button 
                    onClick={() => setActiveTab('staff')}
                    className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'staff' ? 'border-b-2 border-primary text-white' : 'text-text-muted hover:text-white'}`}
                >
                    Staff/Referees ({referees.length})
                </button>
            </div>

            {activeTab === 'tournaments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {tournaments.map((tournament) => (
                         <Link key={tournament._id} href={`/dashboard/tournaments/${tournament._id}`}>
                            <Card className="group hover:border-primary/30 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-surface-highlight flex items-center justify-center font-bold text-xl text-primary">
                                            {tournament.title.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                                                {tournament.title}
                                            </h3>
                                            <p className="text-sm text-text-muted">{tournament.game}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                        tournament.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        tournament.status === 'Draft' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                        'bg-white/5 text-text-muted border-white/10'
                                    }`}>
                                        {tournament.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-xs text-text-muted">
                                        {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBD'}
                                    </span>
                                    <Button size="sm" variant="secondary">View Details</Button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                    {tournaments.length === 0 && (
                        <div className="col-span-2 text-center text-text-muted py-10">
                            No tournaments found for this academy.
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'students' && (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-text-muted uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Batch</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {members.length === 0 ? (
                                    <tr><td colSpan="5" className="p-6 text-center text-text-muted">No students found.</td></tr>
                                ) : (
                                    members.map((member) => (
                                        <tr key={member._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{member.name}</td>
                                            <td className="px-6 py-4 text-text-muted">{member.phone || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs border border-white/10">
                                                    {member.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-text-muted">{member.batch || 'N/A'}</td>
                                            <td className="px-6 py-4 text-text-muted">
                                                {member.joiningDate ? new Date(member.joiningDate).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'staff' && (
                <Card className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-text-muted uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {referees.length === 0 ? (
                                    <tr><td colSpan="4" className="p-6 text-center text-text-muted">No staff found.</td></tr>
                                ) : (
                                    referees.map((ref) => (
                                        <tr key={ref._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{ref.name}</td>
                                            <td className="px-6 py-4 text-text-muted">{ref.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                    ref.role === 'referee' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-white/5 text-text-muted border-white/10'
                                                }`}>
                                                    {ref.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                    ref.isActive !== false ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                    {ref.isActive !== false ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
