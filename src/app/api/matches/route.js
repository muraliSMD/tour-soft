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
        const user = await protect(req);
        await connectDB();

        let matches;
        
        if (user.role === 'owner') {
            // Owner sees all matches
            matches = await Match.find().populate('tournament referee', 'title name');
        } else if (user.role === 'admin') {
            // Admin sees matches from their tournaments
            const userTournaments = await Tournament.find({ user: user._id });
            const tournamentIds = userTournaments.map(t => t._id);
            matches = await Match.find({ tournament: { $in: tournamentIds } }).populate('tournament referee', 'title name');
        } else if (user.role === 'referee') {
            // Referee sees matches they're assigned to
            matches = await Match.find({ referee: user._id }).populate('tournament', 'title');
        } else {
            // Players see all matches (read-only)
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
        const { tournament, matchNumber, team1, team2, targetScore } = body;

        if (!tournament || !matchNumber || !team1 || !team2) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
        }

        const match = await Match.create({
            tournament,
            matchNumber,
            team1: { name: team1, score: 0 },
            team2: { name: team2, score: 0 },
            targetScore: targetScore || 20
        });

        return NextResponse.json(match, { status: 201 });
    } catch (error) {
        console.error('Error creating match:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
