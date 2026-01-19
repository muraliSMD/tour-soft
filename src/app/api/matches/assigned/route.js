import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { protect } from '@/lib/auth';

// Ensure models are registered
import '@/models/Tournament';

export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const matches = await Match.find({ referee: user._id })
            .populate('team1', 'name players')
            .populate('team2', 'name players')
            .populate('tournament', 'title')
            .sort({ date: 1 });
        
        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching assigned matches:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
