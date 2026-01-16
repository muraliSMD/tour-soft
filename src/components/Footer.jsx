import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <span className="text-white font-bold text-xl">T</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">TorSoft</span>
                        </Link>
                        <p className="text-text-muted text-sm leading-relaxed">
                            The ultimate platform for organizing and managing multi-sport tournaments with ease and style.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Features</Link></li>
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">API</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Guides</Link></li>
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Privacy</Link></li>
                            <li><Link href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-text-muted text-sm">
                        &copy; {new Date().getFullYear()} TorSoft. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                         {/* Social icons placeholders */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
