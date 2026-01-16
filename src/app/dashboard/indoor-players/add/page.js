"use client";

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMemberStore from '@/store/useMemberStore';
import { useRouter } from 'next/navigation';

export default function AddMemberPage() {
    const { addMember } = useMemberStore();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'player', // Default
        batch: 'morning',
        category: 'adult',
        joiningDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addMember(formData);
            router.push('/dashboard/indoor-players');
        } catch (error) {
            console.error(error);
            alert('Failed to add member');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
             <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
                <h2 className="text-2xl font-bold text-white">Add New Member</h2>
            </div>
            
            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-text-muted mb-1">Phone</label>
                            <input
                                type="tel"
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-muted mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                             <select
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                             >
                                <option value="player">Regular Player</option>
                                <option value="training">Training Student</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-muted mb-1">Batch</label>
                             <select
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.batch}
                                onChange={e => setFormData({...formData, batch: e.target.value})}
                             >
                                <option value="morning">Morning</option>
                                <option value="evening">Evening</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-muted mb-1">Category</label>
                             <select
                                className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                             >
                                <option value="adult">Adult</option>
                                <option value="children">Children</option>
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Joining Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.joiningDate}
                            onChange={e => setFormData({...formData, joiningDate: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Initial Notes</label>
                        <textarea
                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                            rows="3"
                            placeholder="Checking pending fees, grip charges..."
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>

                    <Button type="submit" className="w-full mt-4">Add Member</Button>
                </form>
            </Card>
        </div>
    );
}
