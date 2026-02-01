import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { protect } from '@/lib/auth';

// PUT /api/matches/[id]/assign-referee
export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const { refereeId } = await req.json();
        
        // Only Admin or Owner can assign referees
        if (user.role !== 'admin' && user.role !== 'owner') {
             return NextResponse.json({ message: 'Not authorized to assign referees' }, { status: 403 });
        }

        const match = await Match.findById(id);

        if (!match) {
            return NextResponse.json({ message: 'Match not found' }, { status: 404 });
        }

        match.referee = refereeId || undefined; // Allow unassigning by sending null
        await match.save();

        // Populate to return full object
        await match.populate('referee', 'name email');

        return NextResponse.json({ success: true, data: match });

    } catch (error) {
        console.error('Error assigning referee:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
