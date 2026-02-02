'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AcademiesPage() {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAcademies();
  }, []);

  const fetchAcademies = async () => {
    try {
      const res = await fetch('/api/academies');
      const data = await res.json();
      if (data.success) {
        setAcademies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch academies', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAcademies = academies.filter(academy =>
    academy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Discover Academies
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Find the best sports academies near you, join tournaments, and elevate your game.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-full leading-5 bg-neutral-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search academies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAcademies.map((academy) => (
              <Link 
                href={`/academies/${academy.slug || academy._id}`} 
                key={academy._id}
                className="group bg-neutral-800 rounded-2xl overflow-hidden hover:bg-neutral-750 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-800"
              >
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 relative">
                  {academy.logo && academy.logo !== 'no-photo.jpg' ? (
                     <img 
                       src={academy.logo} 
                       alt={academy.name} 
                       className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                     />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-16 h-16 text-gray-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                    {academy.sports?.[0] || 'Multi-Sport'}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {academy.name}
                  </h3>
                  
                  {academy.location && (
                    <div className="flex items-center text-gray-400 text-sm mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{academy.location.city || 'Location N/A'}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                     <div className="w-full h-px bg-gray-700/50 my-4"></div>
                     <p className="text-blue-400 text-sm font-medium flex items-center">
                        View Academy <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                     </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && filteredAcademies.length === 0 && (
            <div className="text-center text-gray-500 mt-12">
                No academies found matching your search.
            </div>
        )}
      </div>
    </div>
  );
}
