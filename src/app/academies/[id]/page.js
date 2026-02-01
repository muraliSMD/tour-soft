'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { MapPin, Phone, Mail, Globe, Share2, Calendar, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function AcademyProfilePage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  
  const [academy, setAcademy] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Academy Details
        const academyRes = await fetch(`/api/academies/${id}`);
        const academyData = await academyRes.json();

        if (!academyData.success) {
          setError('Academy not found');
          return;
        }
        setAcademy(academyData.data);

        // Fetch Tournaments
        const tourneyRes = await fetch(`/api/academies/${id}/tournaments`);
        const tourneyData = await tourneyRes.json();
        if (tourneyData.success) {
          setTournaments(tourneyData.data);
        }

      } catch (err) {
        setError('Failed to load academy data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
     return (
        <div className="min-h-screen bg-neutral-900 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
     );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center text-white">
            <h1 className="text-3xl font-bold mb-4">Oops!</h1>
            <p className="text-gray-400">{error}</p>
            <Link href="/academies" className="mt-6 text-blue-400 hover:underline">← Back to Academies</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-r from-gray-900 to-gray-800">
        {academy.bannerImage && (
            <div className="absolute inset-0">
                <img src={academy.bannerImage} className="w-full h-full object-cover opacity-40" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
            </div>
        )}
        
        <div className="absolute -bottom-16 left-0 right-0 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-end">
            <div className="flex flex-col md:flex-row items-center md:items-end w-full">
                <div className="h-32 w-32 rounded-2xl bg-neutral-800 border-4 border-neutral-900 shadow-2xl overflow-hidden flex-shrink-0">
                    {academy.logo && academy.logo !== 'no-photo.jpg' ? (
                        <img src={academy.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <Trophy className="w-12 h-12 text-gray-500" />
                        </div>
                    )}
                </div>
                <div className="md:ml-6 mb-2 text-center md:text-left flex-1">
                    <h1 className="text-4xl font-bold text-white">{academy.name}</h1>
                    <div className="flex items-center justify-center md:justify-start text-gray-400 mt-2 space-x-4 text-sm">
                        {academy.location?.city && (
                             <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {academy.location.city}</span>
                        )}
                        {academy.sports && (
                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                {academy.sports.join(', ')}
                            </span>
                        )}
                    </div>
                </div>
                <div className="mb-4 hidden md:block">
                     <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center transition">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                     </button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-neutral-800/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-bold mb-4 text-gray-200">About</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    {academy.description || "No description provided."}
                </p>

                <div className="mt-6 space-y-3">
                    {academy.contactEmail && (
                        <div className="flex items-center text-gray-400 text-sm">
                            <Mail className="w-4 h-4 mr-3 text-blue-500" /> 
                            {academy.contactEmail}
                        </div>
                    )}
                    {academy.contactPhone && (
                        <div className="flex items-center text-gray-400 text-sm">
                            <Phone className="w-4 h-4 mr-3 text-green-500" />
                            {academy.contactPhone}
                        </div>
                    )}
                    {academy.website && (
                         <div className="flex items-center text-gray-400 text-sm">
                            <Globe className="w-4 h-4 mr-3 text-purple-500" />
                            <a href={academy.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                                Website
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Tournaments */}
        <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold">Upcoming Tournaments</h2>
                 {tournaments.length > 0 && (
                     <span className="text-sm text-gray-400">{tournaments.length} Active</span>
                 )}
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-neutral-800/50 rounded-2xl p-12 text-center border border-dashed border-gray-700">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No Upcoming Tournaments</h3>
                    <p className="text-gray-500 mt-2">Check back later for new events.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map((tournament) => (
                        <Link 
                            href={`/tournamentdetails?id=${tournament._id}`} 
                            key={tournament._id}
                            className="block bg-neutral-800 rounded-xl p-6 hover:bg-neutral-750 transition border border-gray-800 group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">
                                        {tournament.game} • {tournament.format}
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {tournament.title}
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-400 flex items-center space-x-4">
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                            tournament.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                                        }`}>
                                            {tournament.status}
                                        </span>
                                        <span className="flex items-center">
                                            <Users className="w-3 h-3 mr-1" />
                                            {tournament.maxParticipants} Spots
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
