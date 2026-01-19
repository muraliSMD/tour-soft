import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models are registered
import '@/models/Tournament';
import '@/models/User';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        const match = await Match.findById(id)
            .populate('referee', 'name email')
            .populate('tournament', 'title game');

        if (!match) {
            return NextResponse.json({ message: 'Match not found' }, { status: 404 });
        }

        return NextResponse.json(match);
    } catch (error) {
        console.error('Error fetching match:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        const match = await Match.findById(id);

        if (!match) {
            return NextResponse.json({ message: 'Match not found' }, { status: 404 });
        }

        // Check permissions: Owner/Admin or Assigned Referee
        const canEdit = 
            user.role === 'owner' || 
            user.role === 'admin' || 
            (user.role === 'referee' && match.referee?.toString() === user.id);

        if (!canEdit) {
            return NextResponse.json({ message: 'Not authorized to update this match' }, { status: 403 });
        }

        const body = await req.json();
        const { status, winner } = body;

        if (status) match.status = status;
        if (winner) match.winner = winner;

        await match.save();
        return NextResponse.json(match);
    } catch (error) {
        console.error('Error updating match:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        
        const match = await Match.findById(id);

        if (!match) {
            return NextResponse.json({ message: 'Match not found' }, { status: 404 });
        }

        await match.deleteOne();
        return NextResponse.json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
