import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import { protect } from '@/lib/auth';

// GET /api/tournaments
export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        let tournaments;
        const { searchParams } = new URL(req.url);
        const queryUser = searchParams.get('user');

        // Filter tournaments based on user role
        if (user.role === 'owner') {
            // Owner sees ALL tournaments
            if (queryUser) {
                tournaments = await Tournament.find({ user: queryUser });
            } else {
                tournaments = await Tournament.find();
            }
        } else if (user.role === 'admin') {
            // Admin sees only their own tournaments
            let query = { user: user.id };
            
            // If admin has sport specialization, filter by those sports too
            if (user.sports && user.sports.length > 0) {
                query.game = { $in: user.sports };
            }
            
            tournaments = await Tournament.find(query);
        } else {
            // Player/Referee sees ALL tournaments (read-only)
            tournaments = await Tournament.find();
        }

        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: error.message === 'Not authorized, token failed' ? 401 : 500 });
    }
}

// POST /api/tournaments
export async function POST(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const body = await req.json();
        const { title, game, format, maxParticipants, event } = body;

        if (!title || !game || !format) {
            return NextResponse.json({ message: 'Please add all required fields' }, { status: 400 });
        }

        if (game === 'Badminton' && !event) {
            return NextResponse.json({ message: 'Please select a badminton event' }, { status: 400 });
        }

        const tournament = await Tournament.create({
            user: user._id, // Use _id from the protected user object
            title,
            game,
            format,
            maxParticipants,
            event: game === 'Badminton' ? event : undefined
        });

        return NextResponse.json(tournament, { status: 201 });
    } catch (error) {
        console.error('Error creating tournament:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
