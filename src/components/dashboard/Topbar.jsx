"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/useAuthStore';

const Topbar = ({ isSidebarOpen, toggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const { user, logout } = useAuthStore();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
    };

    // Get user initials from name
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    return (
        <header className={`fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 left-0 ${isSidebarOpen ? 'md:left-64' : 'md:left-20'}`}>
            <div className="flex items-center gap-4">
                 <Button size="sm" variant="ghost" className="md:hidden" onClick={toggleSidebar}>
                     <span className="sr-only">Toggle Sidebar</span>
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                     </svg>
                 </Button>

                 <Button size="sm" variant="ghost" className="hidden md:flex" onClick={toggleSidebar}>
                     <svg className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                     </svg>
                 </Button>

                <span className="text-text-muted text-sm font-medium">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
                <Button size="sm" variant="ghost">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </Button>
                
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary p-[2px] hover:scale-105 transition-transform"
                    >
                        <div className="h-full w-full rounded-full bg-surface flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{getUserInitials()}</span>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-surface/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
                                {user?.role && (
                                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-md bg-primary/20 text-primary">
                                        {user.role}
                                    </span>
                                )}
                            </div>

                            {/* Logout Button */}
                            <div className="p-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all group"
                                >
                                    <svg 
                                        className="w-4 h-4 group-hover:text-red-400 transition-colors" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                        />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
