"use client";

import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">TorSoft</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/features" className="hover:text-primary transition-colors px-3 py-2 text-sm font-medium">Features</Link>
              <Link href="/tournamentdetails" className="hover:text-primary transition-colors px-3 py-2 text-sm font-medium">Tournaments</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors px-3 py-2 text-sm font-medium">Pricing</Link>
              <Link href="/about" className="hover:text-primary transition-colors px-3 py-2 text-sm font-medium">About</Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-text-muted hover:text-white text-sm font-medium transition-colors">Log in</Link>
            <Link href="/signup">
                <Button size="sm">Get Started</Button>
            </Link>
          </div>
          
          <div className="md:hidden">
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="text-text-muted hover:text-white p-2"
             >
               <span className="sr-only">Open menu</span>
               {isMobileMenuOpen ? (
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               ) : (
                 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                 </svg>
               )}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-white/5 shadow-lg animate-fade-in-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/tournamentdetails" 
              className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tournaments
            </Link>
            <Link 
              href="/pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 pb-2 border-t border-white/5 mt-2">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <div className="px-3 mt-2">
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full justify-center">Get Started</Button>
                    </Link>
                </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
