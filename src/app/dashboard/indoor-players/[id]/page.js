"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import useMemberStore from '@/store/useMemberStore';
import api from '@/lib/axios'; // Keep for fees/notes if store doesn't handle them
import { useState, useEffect } from 'react'; // Explicit import

export default function MemberProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    const { deleteMember } = useMemberStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fee Form State
    const [feeMonth, setFeeMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [feeAmount, setFeeAmount] = useState('');

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await api.get(`/members/${params.id}`);
                setMember(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchMember();
    }, [params.id]);

    const handleAddFee = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/members/${params.id}/fees`, {
                month: feeMonth,
                amount: feeAmount,
                status: 'paid'
            });
            setMember(res.data);
            setFeeAmount('');
            alert('Fee recorded successfully');
        } catch (error) {
            console.error(error);
            alert('Failed to record fee');
        }
    };

    const handleUpdateNotes = async () => {
        try {
            const res = await api.put(`/members/${params.id}`, { notes: member.notes });
            setMember(res.data);
            alert('Notes updated');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-white">Loading profile...</div>;
    if (!member) return <div className="text-white">Member not found</div>;

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMember(member._id);
            router.push('/dashboard/indoor-players');
        } catch (error) {
            console.error("Failed to delete member", error);
            alert("Failed to delete member");
            setShowDeleteModal(false);
        }
    };

    // ... (rest of render until delete button)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
                <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={handleDeleteClick}>Delete Member</Button>
                </div>
            </div>

            {/* Delete Modal */}
             {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 border-red-500/30">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Member?</h3>
                        <p className="text-text-muted mb-6">
                            Are you sure you want to delete {member.name}?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={confirmDelete}>
                                Yes, Delete
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Header Card */}
            <Card className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{member.name}</h1>
                        <div className="flex gap-4 text-text-muted text-sm">
                            <span>Phone: {member.phone || 'N/A'}</span>
                            <span>•</span>
                            <span>Joined: {new Date(member.joiningDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize text-primary">{member.type}</span>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            member.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {member.status}
                        </span>
                        <p className="text-sm text-text-muted mt-2 capitalize">{member.batch} Batch</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Fees Section */}
                <div className="space-y-4">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Record Payment</h3>
                        <form onSubmit={handleAddFee} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-text-muted block mb-1">Month</label>
                                <input 
                                    type="month" 
                                    value={feeMonth}
                                    onChange={e => setFeeMonth(e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-white"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-text-muted block mb-1">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={feeAmount}
                                    onChange={e => setFeeAmount(e.target.value)}
                                    className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-white"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <Button type="submit" size="sm">Mark Paid</Button>
                        </form>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {member.fees.length === 0 && <p className="text-text-muted text-sm">No payment history.</p>}
                            {[...member.fees].reverse().map((fee, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <div>
                                        <p className="text-white font-medium">{fee.month}</p>
                                        <p className="text-xs text-text-muted">
                                            {fee.status === 'paid' ? `Paid on ${new Date(fee.paidDate).toLocaleDateString()}` : 'Pending'}
                                        </p>
                                    </div>
                                    <span className={`font-bold ${fee.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        ₹{fee.amount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Notes & Extra Info */}
                <div className="space-y-4">
                    <Card className="p-6 h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4">Notes & Remarks</h3>
                        <textarea
                            className="flex-1 w-full bg-surface/50 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:border-primary/50"
                            placeholder="Enter pending amounts, grip charges, or other notes..."
                            value={member.notes}
                            onChange={e => setMember({...member, notes: e.target.value})}
                        ></textarea>
                        <div className="mt-4 flex justify-end">
                            <Button size="sm" onClick={handleUpdateNotes}>Save Notes</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
