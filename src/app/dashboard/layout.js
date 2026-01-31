"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import useAuthStore from '@/store/useAuthStore';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed for mobile
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // On Desktop, default to open if screen is large enough
        if (window.innerWidth >= 768) {
            setIsSidebarOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isMounted && !user) {
            router.replace('/login');
        }
    }, [user, router, isMounted]);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, [pathname]);

    if (!isMounted) return null;

    if (!user) return null; // Prevent flash of content

    return (
        <div className="min-h-screen bg-background text-text-main flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />
            
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-20'}`}>
                
                {/* Topbar */}
                <Topbar 
                    isSidebarOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                />

                {/* Page Content */}
                <main className="flex-1 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs />
                    {children}
                </main>
            </div>
        </div>
    );
}
