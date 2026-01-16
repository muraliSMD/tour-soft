"use client";

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import useMemberStore from '@/store/useMemberStore';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';

export default function AttendanceReportsPage() {
    const { user } = useAuthStore();
    const { members, fetchMembers } = useMemberStore();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [batch, setBatch] = useState('morning');
    const [monthlyData, setMonthlyData] = useState([]); // Array of daily records
    const [loading, setLoading] = useState(false);

    // Owner specific state
    const [viewMode, setViewMode] = useState('list'); // 'list' (academies) or 'report'
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({}); // { adminId: { training: 0, player: 0 } }

    useEffect(() => {
        // Initial Fetch based on role
        const init = async () => {
             if (user?.role === 'owner') {
                 // Fetch all members to calculate stats
                 await fetchMembers(); 
                 // Fetch Admins
                 try {
                     const res = await api.get('/users?role=admin');
                     setAdmins(res.data);
                 } catch (e) {
                     console.error("Failed to fetch admins", e);
                 }
             } else {
                 // Admin/Other: just fetch their own members
                 await fetchMembers();
                 setViewMode('report');
             }
        };
        init();
    }, [user, fetchMembers]);

    // Calculate Stats for Owner View
    useEffect(() => {
        if (user?.role === 'owner' && members.length > 0 && admins.length > 0) {
            const newStats = {};
            admins.forEach(admin => {
                const adminMembers = members.filter(m => m.user === admin._id);
                newStats[admin._id] = {
                    training: adminMembers.filter(m => m.type === 'training').length,
                    player: adminMembers.filter(m => m.type === 'player').length, // Assuming 'player' type for indoor? User said "indoor players"
                    total: adminMembers.length
                };
            });
            setStats(newStats);
        }
    }, [members, admins, user]);

    // Fetch Attendance Data when in Report Mode
    useEffect(() => {
        if (viewMode === 'report') {
            const fetchMonthlyData = async () => {
                setLoading(true);
                try {
                    // Filter attendance by user if Owner selected one
                    // NOTE: The backend /attendance route currently doesn't filter by USER creator directly, 
                    // it returns records matching the BATCH + DATE. 
                    // However, batches might be named same across academies?
                    // Ideally, we need to filter attendance by the members BELONGING to the selected Admin.
                    // Or update backend to filter by Creator.
                    // For now, let's assume fetching by batch retrieves records. 
                    // We will filter visually by 'students' list which IS filtered.
                    
                    const res = await api.get(`/attendance?month=${month}&batch=${batch}`);
                    setMonthlyData(res.data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchMonthlyData();
        }
    }, [month, batch, viewMode]);

    const handleAdminSelect = (admin) => {
        setSelectedAdmin(admin);
        setViewMode('report');
        // We already have all members loaded, so 'students' filter will work if we use selectedAdmin.
    };

    const handleBackToAcademies = () => {
        setSelectedAdmin(null);
        setViewMode('list');
    };

    // --- Render Academy List (Owner Only) ---
    if (viewMode === 'list' && user?.role === 'owner') {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Attendance Overview</h2>
                    <p className="text-text-muted">Select an Academy to view detailed attendance reports</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admins.map(admin => (
                        <Card 
                            key={admin._id} 
                            className="p-6 cursor-pointer hover:border-primary/50 transition-all group"
                            onClick={() => handleAdminSelect(admin)}
                        >
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{admin.name}</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Training Students</span>
                                    <span className="text-white font-medium">{stats[admin._id]?.training || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Indoor Players</span>
                                    <span className="text-white font-medium">{stats[admin._id]?.player || 0}</span>
                                </div>
                                <div className="pt-2 border-t border-white/5 flex justify-between font-bold">
                                    <span className="text-text-muted">Total Members</span>
                                    <span className="text-primary">{stats[admin._id]?.total || 0}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {admins.length === 0 && <div className="text-text-muted">No academies found.</div>}
                </div>
            </div>
        );
    }

    // --- Render Report View (Admin or Selected Academy) ---
    
    // Helpers to generate days
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter Eligible Students
    // If Owner selected an admin, filter members by that admin. If Admin logged in, they see their own (fetched by store).
    const relevantMembers = selectedAdmin 
        ? members.filter(m => m.user === selectedAdmin._id)
        : members;

    const students = relevantMembers.filter(m => m.type === 'training' && m.batch === batch);

    // Create a Lookup Map: 'YYYY-MM-DD' -> { memberId: status }
    const attendanceMap = {};
    monthlyData.forEach(dayRecord => {
        // Use local date to avoid UTC shifting
        // en-CA locale gives YYYY-MM-DD format
        const dateKey = new Date(dayRecord.date).toLocaleDateString('en-CA');
        attendanceMap[dateKey] = {};
        
        dayRecord.records.forEach(r => {
             // Safe check for member existence
            if (r.member) {
                attendanceMap[dateKey][r.member._id || r.member] = r.status;
            }
        });
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'present': return 'bg-green-500';
            case 'absent': return 'bg-red-500';
            case 'late': return 'bg-yellow-500';
            default: return 'bg-transparent';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 {user?.role === 'owner' && (
                    <button onClick={handleBackToAcademies} className="text-text-muted hover:text-white transition-colors">
                        ← Back to Academies
                    </button>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-white">Attendance Reports</h2>
                    <p className="text-text-muted">
                        {selectedAdmin ? `Viewing report for ${selectedAdmin.name}` : 'Monthly view of student attendance'}
                    </p>
                </div>
            </div>

            <Card className="p-4 flex gap-4">
                <input 
                    type="month" 
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                />
                 <select 
                    value={batch} 
                    onChange={(e) => setBatch(e.target.value)}
                    className="bg-surface-highlight border border-white/10 rounded px-3 py-2 text-white"
                >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                </select>
            </Card>

            <div className="overflow-x-auto">
                <Card className="p-0 min-w-max">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-highlight border-b border-white/5 text-text-muted text-xs">
                                <th className="p-3 sticky left-0 bg-surface-highlight z-10 w-48">Student Name</th>
                                {daysArray.map(day => (
                                    <th key={day} className="p-2 text-center w-8">{day}</th>
                                ))}
                                <th className="p-3 text-center">Total Present</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {students.map(student => {
                                let presentCount = 0;
                                return (
                                    <tr key={student._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 sticky left-0 bg-surface font-medium text-white border-r border-white/5">
                                            {student.name}
                                        </td>
                                        {daysArray.map(day => {
                                            // Construct 'YYYY-MM-DD' for current cell column
                                            const dayStr = `${month}-${String(day).padStart(2, '0')}`;
                                            
                                            const status = attendanceMap[dayStr]?.[student._id];
                                            if (status === 'present') presentCount++; // Only count 'present' not 'late' as per typical request, or change based on pref
                                            if (status === 'late') presentCount += 0.5; // Optional logic: Late = 0.5? For now keeping count simple. Actually user said "present list", I'll count present + late

                                            return (
                                                <td key={day} className="p-2 border-r border-white/5 last:border-0 text-center">
                                                    {status && (
                                                        <div 
                                                            className={`w-3 h-3 rounded-full mx-auto ${getStatusColor(status)}`} 
                                                            title={status}
                                                        />
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 text-center text-primary font-bold">
                                            {Math.floor(presentCount)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={daysInMonth + 2} className="p-8 text-center text-text-muted">
                                        No students found in this batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
            
            <div className="flex gap-4 text-xs text-text-muted">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Present</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Late</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent</div>
            </div>
        </div>
    );
}
