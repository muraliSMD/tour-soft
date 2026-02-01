"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useTournamentStore from '@/store/useTournamentStore';

const Breadcrumbs = ({ className = "" }) => {
    const pathname = usePathname();
    
    // Split pathname into segments and remove empty strings
    const pathSegments = pathname.split('/').filter(segment => segment !== '');

    // Map specific paths to user-friendly names
    const pathNameMapping = {
        'dashboard': 'Dashboard',
        'tournaments': 'Tournaments',
        'tournamentdetails': 'Tournaments', // Mapping tournamentdetails to 'Tournaments' for cleaner UI
        'create': 'Create',
        'register': 'Register',
        'login': 'Login',
        'signup': 'Sign Up',
        'about': 'About',
        'features': 'Features',
        'pricing': 'Pricing',
        'referee': 'Referee',
        'users': 'Users',
        'player': 'Player',
        'settings': 'Settings',
        'indoor-players': 'Indoor Players',
        'attendance': 'Attendance',
        'reports': 'Reports'
    };

    // Generate breadcrumb items
    let breadcrumbs = pathSegments.map((segment, index) => {
        // Construct the URL up to this segment
        let href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        
        // Use mapping or capitalize the segment
        let label = pathNameMapping[segment] || segment;
        
        // Fix for public 'tournaments' route 404 - redirect to the actual list page 'tournamentdetails'
        // But ONLY if we are not in dashboard (since /dashboard/tournaments is valid)
        if (segment === 'tournaments' && !pathname.startsWith('/dashboard')) {
            href = '/tournamentdetails';
        }
        
        if (segment.length > 20 && !pathNameMapping[segment]) {
            label = 'Details';
        } else if (!pathNameMapping[segment]) {
             // Basic capitalization for unmapped segments
             label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        }

        return {
            label,
            href,
            isLast: index === pathSegments.length - 1,
            originalSegment: segment
        };
    });

    // CUSTOM LOGIC: Inject Academy into breadcrumbs if viewing a tournament
    // This is a "Smart" Breadcrumb feature for this specific app requirement
    const { activeTournament } = useTournamentStore();
    
    // Check if we are on a tournament details page
    if (pathSegments.includes('tournaments') && pathSegments.length > 2 && activeTournament && activeTournament.academy) {
        const tournamentIndex = breadcrumbs.findIndex(b => b.originalSegment === 'tournaments');
        if (tournamentIndex !== -1) {
             const academyCrumb = {
                label: activeTournament.academy.name || 'Academy',
                href: `/dashboard/academies/${activeTournament.academy._id || activeTournament.academy}`,
                isLast: false
             };
             
             // Check if already there to avoid dupes (unlikely with this logic but good practice)
             // We insert Academy BEFORE "Tournaments" per user request "dashboard - mm academy - tournaments"
             // Wait, user said: "dashboard - mm accadamy - tournaments - tournament"
             
             // Current: Dashboard > Tournaments > [ID]
             // Desired: Dashboard > [Academy] > Tournaments > [ID] or [Title]
             
             // So insert at tournamentIndex
             breadcrumbs.splice(tournamentIndex, 0, academyCrumb);
        }
        
        // Also replace the generic "Details" or ID with the Tournament Title
        const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
        if (lastCrumb && activeTournament.title) {
            lastCrumb.label = activeTournament.title;
        }
    }

    // Don't render on home page (pathSegments length is 0)
    if (pathSegments.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={`text-sm text-text-muted mb-4 ${className}`}>
            <ol className="list-none p-0 inline-flex">
                {!pathname.startsWith('/dashboard') && (
                    <li className="flex items-center">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Home
                        </Link>
                    </li>
                )}
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.href} className="flex items-center">
                        <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                            <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
                        </svg>
                        {crumb.isLast ? (
                            <span className="text-white font-medium" aria-current="page">
                                {crumb.label}
                            </span>
                        ) : (
                            <Link href={crumb.href} className="hover:text-primary transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
