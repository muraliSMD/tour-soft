
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';

// GET /api/public/tournaments/[id]
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const tournament = await Tournament.findById(id).select('title game format status startDate endDate entryFee currency');

        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error('Error fetching public tournament:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
