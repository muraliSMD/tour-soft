"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

const Sidebar = ({ isOpen }) => {
    const router = useRouter();
    const { logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    // Icons (keeping them defined inside for simplicity in this snippet)
    const GridIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );

    const TrophyIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
    
    const UsersIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );

    const SettingsIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const LogoutIcon = () => (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );

    return (
        <aside 
            className={`
                fixed inset-y-0 left-0 bg-surface border-r border-white/5 z-40 flex flex-col transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isOpen ? 'w-64' : 'w-64 md:w-20'}
            `}
        >
            <div className={`flex items-center h-16 px-6 border-b border-white/5 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    {isOpen && <span className="font-bold text-xl tracking-tight text-white animate-fade-in">TorSoft</span>}
                </Link>
            </div>

            <div className="flex-1 flex flex-col pt-6 px-3 gap-2">
                
                {/* Dashboard / Overview - Visible to Admin/Owner/Referee */}
                {user && user.role !== 'player' && user.role !== 'user' && (
                    <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                        <GridIcon />
                        {isOpen && <span className="font-medium whitespace-nowrap">Overview</span>}
                    </Link>
                )}

                {/* Owner/Admin Management Links */}
                {user && (user.role === 'owner' || user.role === 'admin') && (
                    <>
                        <Link href="/dashboard/academies" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {isOpen && <span className="font-medium whitespace-nowrap">Academies</span>}
                        </Link>
                        
                        {/* Only show Tournaments link for Admins or Referees, Owners go through Academy */}
                        
                        <Link href="/dashboard/tournaments" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                            <TrophyIcon />
                            {isOpen && <span className="font-medium whitespace-nowrap">Tournaments</span>}
                        </Link>

                        <Link href="/dashboard/indoor-players" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                            <UsersIcon />
                            {isOpen && <span className="font-medium whitespace-nowrap">Indoor Players</span>}
                        </Link>
                        
                        <Link href="/dashboard/attendance/reports" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {isOpen && <span className="font-medium whitespace-nowrap">Attendance Reports</span>}
                        </Link>
                        
                         {/* Hidden 'Users' link for Owner if they should manage Admins inside Academy, keeping it for now but at bottom */}
                         <Link href="/dashboard/users" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {isOpen && <span className="font-medium whitespace-nowrap">All Users</span>}
                        </Link>
                    </>
                )}

                {/* Player Specific Links */}
                {(user?.role === 'user' || user?.role === 'player') && (
                    <Link
                        href="/dashboard/player"
                        className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {isOpen && <span className="font-medium whitespace-nowrap">My Tournaments</span>}
                    </Link>
                )}
            </div>

            <div className="p-4 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className={`flex items-center gap-3 px-3 py-2 mb-2 text-text-muted hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors w-full ${!isOpen && 'justify-center'}`}
                >
                    <LogoutIcon />
                    {isOpen && <span className="font-medium whitespace-nowrap">Logout</span>}
                </button>
                <Link href="/dashboard/settings" className={`flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors ${!isOpen && 'justify-center'}`}>
                    <SettingsIcon />
                    {isOpen && <span className="font-medium whitespace-nowrap">Settings</span>}
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
