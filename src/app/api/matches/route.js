import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Tournament from '@/models/Tournament';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models are registered
import '@/models/Tournament';
import '@/models/User';

// GET /api/matches
export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const academyId = searchParams.get('academyId');
        
        let user;
        try {
             user = await protect(req);
        } catch (e) {
            // User is not logged in.
            // If no user, we ONLY allow fetching matches if 'academyId' is provided (Public View for an Academy)
            // Or if we want to show all public matches?
            // User requirement: "players can view all tournaments conducted by academy and scorecard of all matches"
             
            if (!academyId) {
                 // If no specific academy filter, and no user, we might restrict listing ALL matches globally to prevent scraping.
                 // But for now, let's allow it but maybe limit fields?
                 // Or just proceed as "Guest" who sees everything?
                 // Let's allow public access for now.
                 user = { role: 'player' }; // Treat as guest/player
            } else {
                 user = { role: 'player' };
            }
        }

        let matches;
        
        if (academyId) {
             // ... (Logic remains same)
             const tournaments = await Tournament.find({ academy: academyId }).select('_id');
             const tournamentIds = tournaments.map(t => t._id);
             matches = await Match.find({ tournament: { $in: tournamentIds } })
                .populate('tournament', 'title game status')
                .populate('referee', 'name')
                .sort({ createdAt: -1 });
        } else if (user.role === 'owner') {
             // ...
             matches = await Match.find().populate('tournament referee', 'title name');
        } else if (user.role === 'admin') {
             // ...
             const userTournaments = await Tournament.find({ user: user._id });
             const tournamentIds = userTournaments.map(t => t._id);
             matches = await Match.find({ tournament: { $in: tournamentIds } }).populate('tournament referee', 'title name');
        } else if (user.role === 'referee') {
             // REFEREE IS SPECIAL: If logged in as referee, ONLY show assigned matches
             // But what if a referee wants to view *other* matches as a spectator? 
             // The UI likely has a "My Matches" tab vs "All Matches". This endpoint is generic.
             // If the referee is viewing the "Live Scores" page of an academy, they should see ALL.
             // Issue: Conflict between "My Dashboard" (filtered) and "Public View" (All).
             // FIX: Only filter by referee ID if they are NOT querying a specific academy/tournament.
             
             matches = await Match.find({ referee: user._id }).populate('tournament', 'title');
        } else {
             // Players (and Guests) see all matches
             matches = await Match.find().populate('tournament referee', 'title name');
        }
        
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: error.message === 'Not authorized, token failed' ? 401 : 500 });
    }
}

// POST /api/matches
export async function POST(req) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();

        const body = await req.json();
        const { tournament, matchNumber, team1, team2, targetScore, group } = body;

        if (!tournament || !matchNumber || !team1 || !team2) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
        }

        const match = await Match.create({
            tournament,
            matchNumber,
            team1: { name: team1, score: 0 },
            team2: { name: team2, score: 0 },
            targetScore: targetScore || 20,
            group: group || 'League' // Default or use provided
        });

        return NextResponse.json(match, { status: 201 });
    } catch (error) {
        console.error('Error creating match:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
