'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import useAuthStore from '@/store/useAuthStore';
import api from '@/lib/axios';


// Helper component for Image Upload
function ImageUploader({ label, value, onChange, onRemove }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                onChange(res.data.url);
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative group">
                        <img src={value} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                        <button 
                            type="button"
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center bg-surface-highlight">
                         {uploading ? <Loader2 className="w-6 h-6 animate-spin text-text-muted" /> : <span className="text-xs text-text-muted">No Image</span>}
                    </div>
                )}
                <div className="flex-1">
                     <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-text-muted
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90
                        "
                        disabled={uploading}
                      />
                      <p className="text-xs text-text-muted mt-1">Supported: JPG, PNG, WEBP</p>
                </div>
            </div>
        </div>
    );
}

export default function AcademySettingsPage({ params }) {
    // Unwrap params using React.use()
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    
    // Basic form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        city: '',
        logo: '',
        bannerImage: '',
        gallery: [],
        sports: []
    });

    useEffect(() => {
        fetchAcademy();
    }, [id]);

    const fetchAcademy = async () => {
        try {
            const res = await api.get(`/academies/${id}`);
            const data = res.data;
            if (data.success) {
                const a = data.data;
                setFormData({
                    name: a.name || '',
                    description: a.description || '',
                    contactEmail: a.contactEmail || '',
                    contactPhone: a.contactPhone || '',
                    website: a.website || '',
                    city: a.location?.city || '',
                    logo: a.logo || '',
                    bannerImage: a.bannerImage || '',
                    gallery: a.gallery || [],
                    sports: a.sports || []
                });
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load academy');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                ...formData,
                location: {
                    city: formData.city
                }
            };

            const res = await api.put(`/academies/${id}`, payload);
            const data = res.data;

            if (data.success) {
                setSuccess('Academy updated successfully');
                router.refresh();
            } else {
                setError(data.error || 'Failed to update academy');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-surface rounded-xl border border-white/5 p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-sm">
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Basic Details</h2>
                        
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Academy Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                            ></textarea>
                        </div>
                    </div>


                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-white border-b border-white/5 pb-2">Images & Gallery</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <ImageUploader 
                                label="Academy Logo" 
                                value={formData.logo} 
                                onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                                onRemove={() => setFormData(prev => ({ ...prev, logo: '' }))}
                             />
                             <ImageUploader 
                                label="Banner Image" 
                                value={formData.bannerImage} 
                                onChange={(url) => setFormData(prev => ({ ...prev, bannerImage: url }))}
                                onRemove={() => setFormData(prev => ({ ...prev, bannerImage: '' }))}
                             />
                        </div>

                        {/* Gallery Section */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">Gallery Photos</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {formData.gallery?.map((url, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover rounded-lg border border-white/10" />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }))}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center bg-surface-highlight hover:bg-white/5 transition-colors relative">
                                    <Plus className="w-8 h-8 text-text-muted mb-2" />
                                    <span className="text-xs text-text-muted">Add Photo</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            // Upload directly
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            try {
                                                const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
                                                if (res.data.success) {
                                                    setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), res.data.url] }));
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Upload failed');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link 
                            href="/dashboard/academies"
                            className="bg-transparent hover:bg-white/5 text-text-muted hover:text-white px-6 py-2 rounded-lg font-medium transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>

                {user?.role === 'owner' && (
                    <div className="mt-12 pt-8 border-t border-red-500/20">
                        <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                        <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-xl bg-red-500/5">
                            <div>
                                <div className="font-medium text-white">Delete Academy</div>
                                <div className="text-sm text-text-muted">This action cannot be undone. All tournaments and matches will be lost.</div>
                            </div>
                            <button 
                                onClick={() => setDeleteModalOpen(true)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                            >
                                Delete Academy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal 
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={async () => {
                   try {
                       await api.delete(`/academies/${id}`);
                       router.push('/dashboard/academies');
                   } catch (err) {
                       alert('Failed to delete academy');
                   }
                }}
                title="Delete Academy"
                message="Are you absolutely sure? This will permanently delete the academy and all associated data."
            />
        </div>
    );
}
