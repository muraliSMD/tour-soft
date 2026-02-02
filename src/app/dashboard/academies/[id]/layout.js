'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Users, ArrowLeft } from 'lucide-react';
import { use } from 'react';

import useAuthStore from '@/store/useAuthStore';

export default function AcademyDashboardLayout({ children, params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const pathname = usePathname();
    const { user } = useAuthStore();

    let tabs = [
        { name: 'Overview', href: `/dashboard/academies/${id}`, icon: Users },
        { name: 'Settings', href: `/dashboard/academies/${id}/settings`, icon: Settings },
        { name: 'Profile', href: `/dashboard/academies/${id}/profile`, icon: Users },
        { name: 'Team', href: `/dashboard/academies/${id}/team`, icon: Users },
    ];

    if (user?.role === 'referee') {
        tabs = tabs.filter(t => t.name === 'Overview');
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-3 mb-6">
                 <Link href="/dashboard/academies" className="p-2 hover:bg-white/5 rounded-full transition text-text-muted hover:text-white flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                 </Link>
                 <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Academy Management</h1>
            </div>

            <div className="relative border-b border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <nav className="flex space-x-8 overflow-x-auto no-scrollbar -mb-px">
                    {tabs.map((tab) => {
                        // For the root "Overview" tab, require exact match
                        // For other tabs, allow prefix match (e.g. /settings/advanced)
                        const isRoot = tab.href.endsWith(id); 
                        const isActive = isRoot 
                            ? pathname === tab.href 
                            : pathname.startsWith(tab.href);

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap flex-shrink-0
                                    ${isActive 
                                        ? 'border-blue-500 text-blue-400' 
                                        : 'border-transparent text-text-muted hover:text-white hover:border-white/20'}
                                `}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-2">
                {children}
            </div>
        </div>
    );
}
