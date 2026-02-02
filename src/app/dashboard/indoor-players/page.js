"use client";

import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import useMemberStore from '@/store/useMemberStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IndoorPlayersPage() {
    const { members, fetchMembers, loading } = useMemberStore();
    const [filterBatch, setFilterBatch] = useState('all'); // 'all', 'morning', 'evening'
    const [filterType, setFilterType] = useState('all'); // 'all', 'training', 'player'
    const router = useRouter();

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const filteredMembers = members.filter(m => {
        if (filterBatch !== 'all' && m.batch !== filterBatch) return false;
        if (filterType !== 'all' && m.type !== filterType) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Indoor Players</h2>
                    <p className="text-text-muted">Manage academy members and players</p>
                </div>
                <div className="flex gap-2">
                     <Link href="/dashboard/indoor-players/attendance">
                        <Button variant="secondary">Attendance Tracker</Button>
                    </Link>
                    <Link href="/dashboard/indoor-players/add">
                        <Button>+ Add Member</Button>
                    </Link>
                </div>
            </div>

            <Card className="p-4 flex gap-4">
                <select 
                    value={filterBatch} 
                    onChange={(e) => setFilterBatch(e.target.value)}
                    className="bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                >
                    <option value="all">All Batches</option>
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                </select>
                 <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                >
                    <option value="all">All Types</option>
                    <option value="training">Training Students</option>
                    <option value="player">Regular Players</option>
                </select>
            </Card>

            <div className="grid gap-4">
                {loading && <Loader text="Loading players..." />}
                {!loading && filteredMembers.length === 0 && <p className="text-text-muted">No members found.</p>}
                
                {filteredMembers.map(member => (
                    <Card key={member._id} className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white">{member.name}</h3>
                            <div className="flex gap-2 text-sm text-text-muted">
                                <span className={`capitalize ${member.type === 'training' ? 'text-blue-400' : 'text-green-400'}`}>
                                    {member.type}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{member.batch} Batch</span>
                                <span>•</span>
                                <span className="capitalize">{member.category}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             {/* Fee status indicator placeholder */}
                            <Link href={`/dashboard/indoor-players/${member._id}`}>
                                <Button size="sm" variant="secondary">View Profile</Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
