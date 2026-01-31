
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { protect } from '@/lib/auth';

// Ensure models are registered
import '@/models/Tournament';
import '@/models/User';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        // Fetch matches for specific tournament
        const matches = await Match.find({ tournament: id })
            .populate('team1.name team2.name') // Usually names are embedded, but if referee/users populate needed
            .populate('referee', 'name')
            .populate('tournament', 'title');

        return NextResponse.json(matches);
    } catch (error) {
        console.error('Error fetching tournament matches:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
