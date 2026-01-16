import React from 'react';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for small clubs and friendly matches.',
      features: [
        'Up to 2 Tournaments',
        'Basic Bracket Generation',
        'Manual Scoring',
        'Community Support'
      ],
      cta: 'Get Started',
      variant: 'secondary'
    },
    {
      name: 'Pro',
      price: '₹1,999',
      period: '/month',
      description: 'For growing academies and professional organizers.',
      features: [
        'Unlimited Tournaments',
        'Advanced Brackets & Seeding',
        'Live Scoring & Leaderboards',
        'Academy Management',
        'Priority Support'
      ],
      cta: 'Start Free Trial',
      variant: 'primary',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large organizations.',
      features: [
        'Custom Domain & Branding',
        'Dedicated Server',
        'API Access',
        'SLA Support',
        'On-premise Deployment'
      ],
      cta: 'Contact Sales',
      variant: 'secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Choose the plan that's right for your sports organization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
                key={index} 
                className={`relative bg-surface border rounded-2xl p-8 flex flex-col ${
                    plan.popular ? 'border-primary ring-1 ring-primary/50' : 'border-white/5'
                }`}
            >
                {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-primary/25">
                        Most Popular
                    </div>
                )}
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-text-muted text-sm mb-6 h-10">{plan.description}</p>
                
                <div className="mb-8">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-text-muted">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-text-main">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>

                <Link href="/signup" className="block">
                    <Button variant={plan.variant} className="w-full">{plan.cta}</Button>
                </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
