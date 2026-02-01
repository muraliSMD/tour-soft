'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/ui/Loader';
import api from '@/lib/axios';

export default function CreateAcademyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Basic form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        city: '',
        sports: ['Badminton']
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Construct payload matching Academy model
            const payload = {
                ...formData,
                location: {
                    city: formData.city
                }
            };

            const res = await api.post('/academies', payload);
            const data = res.data;

            if (data.success) {
                router.push('/dashboard/academies');
                router.refresh();
            } else {
                setError(data.error || 'Failed to create academy');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                 <Link href="/dashboard/academies" className="p-2 hover:bg-white/5 rounded-full transition text-text-muted hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                 </Link>
                 <h1 className="text-2xl font-bold text-white">Create New Academy</h1>
            </div>

            <div className="bg-surface rounded-xl border border-white/5 p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Basic Details</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Academy Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g. Elite Sports Academy"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Tell us about your academy..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Contact & Location</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">City/Location</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. New York, NY"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

{/* Sports selection removed as per requirement - defaulting to Badminton */}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader size="small" /> : <Save className="w-4 h-4" />}
                            Create Academy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
