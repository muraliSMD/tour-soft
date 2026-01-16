"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import useAuthStore from '@/store/useAuthStore';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useAuthStore();
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !user) {
            router.replace('/login');
        }
    }, [user, router, isMounted]);

    if (!isMounted) return null;

    if (!user) return null; // Prevent flash of content

    return (
        <div className="min-h-screen bg-background text-text-main flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
                
                {/* Topbar */}
                <Topbar 
                    isSidebarOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                />

                {/* Page Content */}
                <main className="flex-1 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
