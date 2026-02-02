import React from 'react';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        
        <Breadcrumbs />

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Empowering Sports Communities
          </h1>
          <p className="text-xl text-text-muted leading-relaxed">
            At TorSoft, our mission is to simplify sports management so that organizers, coaches, and players can focus on what they love—the game.
          </p>
        </div>

        {/* Story Section */}
        <div className="prose prose-invert max-w-none mb-16">
            <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-text-muted mb-4">
                Founded in 2026, TorSoft emerged from a simple need: managing local badminton tournaments without the chaos of spreadsheets and paper brackets. What started as a small tool has grown into a comprehensive platform serving academies and tournament organizers worldwide.
            </p>
            <p className="text-text-muted">
                We believe that technology should be an enabler, not a hurdle. That's why we build tools that are intuitive, powerful, and accessible to everyone from small clubs to professional leagues.
            </p>
        </div>

        {/* Team Grid */}
        <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet the Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                        <div className="w-24 h-24 rounded-full bg-surface-highlight mx-auto mb-4 border-2 border-primary/20"></div>
                        <h3 className="font-bold text-white">Member Name</h3>
                        <p className="text-sm text-text-muted">Co-Founder / Role</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Contact */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-text-muted mb-6">
                Have questions or need a custom solution? We'd love to hear from you.
            </p>
            <a href="mailto:contact@torsoft.com" className="text-primary hover:text-primary-light font-medium text-lg">
                contact@torsoft.com
            </a>
        </div>

      </div>
    </div>
  );
}
