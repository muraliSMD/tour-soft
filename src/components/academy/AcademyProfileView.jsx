'use client';

import Link from 'next/link';
import { ExternalLink, MapPin, Mail, Phone, Globe } from 'lucide-react';

export default function AcademyProfileView({ academy }) {
    if (!academy) return null;

    return (
        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-900 to-slate-900 relative">
                {academy.bannerImage && (
                    <img src={academy.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                )}
            </div>
            
            <div className="px-6 pb-6 relative">
                {/* Logo & Header Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 -mt-12 sm:-mt-16 mb-6">
                    {/* Logo Container */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-surface bg-surface-highlight overflow-hidden shadow-xl flex-shrink-0">
                        {academy.logo ? (
                            <img src={academy.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white/20">
                                {academy.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Title and Actions */}
                    <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">{academy.name}</h1>
                                <p className="text-text-muted mt-2 text-sm sm:text-base leading-relaxed max-w-2xl">{academy.description || 'No description provided.'}</p>
                            </div>
                            <Link 
                                href={`/academies/${academy.slug || academy._id}`} 
                                target="_blank"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-xl transition font-bold border border-primary/20 shadow-lg shadow-primary/5"
                            >
                                <ExternalLink className="w-4 h-4" /> Public Page
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-text-muted">
                                <Mail className="w-5 h-5 text-primary" />
                                <span>{academy.contactEmail || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-muted">
                                <Phone className="w-5 h-5 text-primary" />
                                <span>{academy.contactPhone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-text-muted">
                                <Globe className="w-5 h-5 text-primary" />
                                {academy.website ? (
                                    <a href={academy.website} target="_blank" rel="noopener" className="hover:text-white transition">{academy.website}</a>
                                ) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-3 text-text-muted">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{academy.location?.city || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Sports & Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                            {academy.sports?.map(sport => (
                                <span key={sport} className="px-3 py-1 rounded-full bg-white/5 text-white text-sm">
                                    {sport}
                                </span>
                            )) || (
                                <span className="text-text-muted">No sports listed</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Gallery Preview */}
                {academy.gallery?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-4">Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {academy.gallery.map((img, i) => (
                                <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-lg border border-white/5" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
