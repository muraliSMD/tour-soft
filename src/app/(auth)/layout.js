import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-40" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 opacity-30" />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">T</span>
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">TorSoft</span>
                    </Link>
                </div>
                
                {children}

                <div className="mt-8 text-center text-sm text-text-muted">
                    &copy; {new Date().getFullYear()} TorSoft. All rights reserved.
                </div>
            </div>
        </div>
    );
}
