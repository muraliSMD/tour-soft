"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/useAuthStore';

export default function PublicRegistrationPage() {
    const params = useParams();
    const router = useRouter();
    // Use auth store to check if user is logged in
    // Note: We need to make sure useAuthStore is available here. It is used in dashboard, assuming it's safe.
    // If this is a purely public page outside of dashboard layout, we might need to wrap it or imported properly.
    // Assuming useAuthStore works globally if Provider is at Root.
    const { user } = useAuthStore ? useAuthStore() : { user: null }; 

    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Smart Registration State
    const [emailStatus, setEmailStatus] = useState('idle'); // idle, checking, exists, new
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const [createdUserId, setCreatedUserId] = useState(null);

    const [formData, setFormData] = useState({
        teamName: '',
        player1: '',
        player2: '',
        phone: '',
        city: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        // Fetch tournament details public

        const fetchTournament = async () => {
            try {
                const { default: api } = await import('@/lib/axios');
                // Use public route
                // Wait... axios instance might have interceptors. 
                // Ideally use fetch for public or axios without auth header requirement?
                // Our axios instance attaches token if exists. That's fine.
                const response = await api.get(`/public/tournaments/${params.id}`);
                setTournament(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load tournament');
            } finally {
                setLoading(false);
            }
        };
        fetchTournament();
    }, [params.id]);

    useEffect(() => {
        if (user) {
            // Pre-fill if user logged in (optional, but nice)
            setFormData(prev => ({
                ...prev,
                player1: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const checkEmail = async () => {
        if (!formData.email || user) return;
        setIsCheckingEmail(true);
        try {
            const { default: api } = await import('@/lib/axios');
            const res = await api.post('/auth/check-email', { email: formData.email });
            if (res.data.exists) {
                setEmailStatus('exists');
            } else {
                setEmailStatus('new');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const handleCreateAccount = async () => {
        setIsSubmitting(true);
        try {
            const { default: api } = await import('@/lib/axios');
            const res = await api.post('/auth/register', {
                name: formData.player1,
                email: formData.email,
                password: formData.password
            });
            
            // Success! 
            // We should ideally log them in. The register API returns a token.
            if (res.data.token && typeof window !== 'undefined') {
                localStorage.setItem('token', res.data.token);
                // Force a reload to pick up the token in axios/store? 
                // Or just proceed with the userId.
                // Reloading is safest to ensure all auth state is consistent.
                // But we don't want to lose the tournament ID context.
                // Let's store the token and reload. Setup useEffect to check token?
                // Actually, if we reload, we lose the filled "player1" name etc?
                // Save form data to sessionStorage?
                
                // Alternative: Just set a local 'createdUser' state and use that ID for registration.
                // Then redirect to login at the end.
                setCreatedUserId(res.data._id);
                setEmailStatus('created'); // Hide step 1 or show "Account Created"
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const teamMembers = [
                { name: formData.player1, phone: formData.phone }
            ];
            if (formData.player2) {
                teamMembers.push({ name: formData.player2, phone: formData.phone });
            }

            const payload = {
                tournamentId: params.id,
                teamName: formData.teamName,
                teamMembers,
                city: formData.city,
                phone: formData.phone,
                userId: user?._id || createdUserId // Pass the ID explicitly
            };

            const res = await fetch('/api/public/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setIsSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    }

    if (error && !tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p className="text-text-muted">{error}</p>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md p-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
                    <p className="text-text-muted mb-8">
                        Your team <strong>{formData.teamName}</strong> has been registered for <strong>{tournament.title}</strong>.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        {user ? (
                            <Link href="/dashboard/player" className="w-full">
                                <Button className="w-full">Go to Dashboard</Button>
                            </Link>
                        ) : (
                            <Link href="/login" className="w-full">
                                <Button className="w-full">Click here to Login</Button>
                            </Link>
                        )}
                        
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-sm text-text-muted hover:text-white transition-colors underline"
                        >
                            Register Another Team
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">{tournament.title}</h1>
                    <div className="flex items-center justify-center gap-4 text-text-muted text-sm">
                        <span>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'Date TBA'}</span>
                        <span>•</span>
                        <span>{tournament.game}</span>
                        {tournament.entryFee > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-primary font-bold">₹{tournament.entryFee} Entry</span>
                            </>
                        )}
                    </div>
                </div>

                <Card className="p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-white mb-4">
                        Register for {tournament.title}
                    </h3>
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Step 1: Email / Auth Check */}
                        {!user && (
                            <div className="space-y-4 border-b border-white/10 pb-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData({...formData, email: e.target.value});
                                                setEmailStatus('idle');
                                            }}
                                            onBlur={checkEmail}
                                            className={`w-full bg-surface-highlight border ${emailStatus === 'exists' ? 'border-yellow-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white`}
                                            required
                                            placeholder="Enter your email to start"
                                            disabled={emailStatus === 'created'}
                                        />
                                        {isCheckingEmail && <span className="text-sm text-text-muted self-center">Checking...</span>}
                                    </div>
                                    
                                    {emailStatus === 'exists' && (
                                        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-500">
                                            <p className="font-bold mb-1">Account found!</p>
                                            <p className="mb-2">You already have an account. Please login to continue registration.</p>
                                            <Button 
                                                type="button" 
                                                size="sm" 
                                                className="w-full"
                                                onClick={() => {
                                                    const returnUrl = encodeURIComponent(window.location.pathname);
                                                    window.location.href = `/login?redirect=${returnUrl}`;
                                                }}
                                            >
                                                Login & Continue
                                            </Button>
                                        </div>
                                    )}

                                    {emailStatus === 'new' && (
                                        <div className="mt-2 space-y-3">
                                             <div>
                                                 <label className="block text-sm font-medium text-text-muted mb-1">Create Password</label>
                                                 <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    required
                                                    placeholder="Choose a password"
                                                    minLength={6}
                                                 />
                                             </div>
                                             <div>
                                                 <label className="block text-sm font-medium text-text-muted mb-1">Your Name</label>
                                                 <input
                                                    type="text"
                                                    name="player1" // Reusing player1 as user name for simplicity
                                                    value={formData.player1}
                                                    onChange={handleChange}
                                                    className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                                    required
                                                    placeholder="Enter your name"
                                                 />
                                             </div>
                                             
                                             <Button 
                                                type="button"
                                                className="w-full"
                                                onClick={handleCreateAccount}
                                                disabled={isSubmitting}
                                             >
                                                {isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}
                                             </Button>
                                             <p className="text-xs text-text-muted mt-1">We'll create an account for you first.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Team Details (Only show if logged in OR new user confirmed) */}
                        {(user || createdUserId) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        name="teamName"
                                        value={formData.teamName}
                                        onChange={handleChange}
                                        className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                        required
                                        placeholder="Enter Team Name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Player 1 Name</label>
                                        <input
                                            type="text"
                                            name="player1"
                                            value={formData.player1}
                                            onChange={handleChange}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                            required
                                            placeholder="Lead Player"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Player 2 Name (Optional)</label>
                                        <input
                                            type="text"
                                            name="player2"
                                            value={formData.player2}
                                            onChange={handleChange}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="For Doubles"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button className="w-full" size="lg" disabled={isSubmitting}>
                                        {isSubmitting ? 'Registering...' : `Register Team ${tournament.entryFee ? `(₹${tournament.entryFee})` : '(Free)'}`}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
}
