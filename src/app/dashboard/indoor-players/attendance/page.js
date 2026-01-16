"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useMemberStore from '@/store/useMemberStore';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
    const { members, fetchMembers } = useMemberStore();
    const router = useRouter();
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [batch, setBatch] = useState('morning');
    const [attendanceRecords, setAttendanceRecords] = useState({}); // { memberId: 'present' | 'absent' | 'late' }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Fetch existing attendance when date/batch changes
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/attendance?date=${date}&batch=${batch}`);
                const records = {};
                
                // Pre-fill from existing records
                if (res.data.records) {
                    res.data.records.forEach(r => {
                        records[r.member._id || r.member] = r.status;
                    });
                }
                
                setAttendanceRecords(records);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [date, batch]);

    // Filter members: Training Type + Selected Batch + Active Status
    const eligibleMembers = members.filter(m => 
        m.type === 'training' && 
        m.batch === batch && 
        m.status === 'active'
    );

    const handleStatusChange = (memberId, status) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [memberId]: status
        }));
    };

    const handleSave = async () => {
        try {
            const records = eligibleMembers.map(m => ({
                member: m._id,
                status: attendanceRecords[m._id] || 'absent'
            }));

            await api.post('/attendance', {
                date,
                batch,
                records
            });
            alert('Attendance saved successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to save attendance');
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
                <h2 className="text-2xl font-bold text-white">Daily Attendance</h2>
            </div>
            
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-sm text-text-muted block mb-1">Date</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="text-sm text-text-muted block mb-1">Batch</label>
                     <select 
                        value={batch} 
                        onChange={(e) => setBatch(e.target.value)}
                        className="w-full bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                    >
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                    </select>
                </div>
                <Button onClick={handleSave} disabled={loading}>Save Attendance</Button>
            </Card>

            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-highlight border-b border-white/5 text-text-muted text-sm">
                            <th className="p-4">Student Name</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading && <tr><td colSpan="2" className="p-4 text-center text-white">Loading records...</td></tr>}
                        
                        {!loading && eligibleMembers.length === 0 && (
                            <tr><td colSpan="2" className="p-4 text-center text-text-muted">No students found for this batch.</td></tr>
                        )}

                        {!loading && eligibleMembers.map(member => {
                            const status = attendanceRecords[member._id] || 'absent';
                            return (
                                <tr key={member._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">{member.name}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleStatusChange(member._id, 'present')}
                                            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                                                status === 'present' 
                                                ? 'bg-green-500 text-white border-green-500' 
                                                : 'text-text-muted border-white/10 hover:border-green-500 hover:text-green-500'
                                            }`}
                                        >
                                            Present
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(member._id, 'late')}
                                            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                                                status === 'late' 
                                                ? 'bg-yellow-500 text-white border-yellow-500' 
                                                : 'text-text-muted border-white/10 hover:border-yellow-500 hover:text-yellow-500'
                                            }`}
                                        >
                                            Late
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(member._id, 'absent')}
                                            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                                                status === 'absent' 
                                                ? 'bg-red-500 text-white border-red-500' 
                                                : 'text-text-muted border-white/10 hover:border-red-500 hover:text-red-500'
                                            }`}
                                        >
                                            Absent
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
