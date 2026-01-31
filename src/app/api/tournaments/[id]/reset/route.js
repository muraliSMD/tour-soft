import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models
import '@/models/Match';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        // Logic: Reset to Draft, Delete Matches
        await Match.deleteMany({ tournament: id });
        
        tournament.status = 'Draft';
        await tournament.save();

        return NextResponse.json({ message: 'Tournament reset to Draft. Matches cleared.', tournament });

    } catch (error) {
        console.error('Error resetting tournament:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
