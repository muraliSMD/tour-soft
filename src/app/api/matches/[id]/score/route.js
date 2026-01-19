import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import { protect } from '@/lib/auth';

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const body = await req.json();
        const { team } = body; // 'team1' or 'team2'

        const match = await Match.findById(id);
        if (!match) {
            return NextResponse.json({ message: 'Match not found' }, { status: 404 });
        }

        if (match.status === 'completed') {
            return NextResponse.json({ message: 'Cannot score a completed match' }, { status: 400 });
        }

        // Verify referee assignment (unless owner/admin)
        if (user.role === 'referee' && match.referee?.toString() !== user.id) {
            return NextResponse.json({ message: 'You are not assigned to this match' }, { status: 403 });
        }

        // Update status to in-progress if it's pending
        if (match.status === 'pending') {
            match.status = 'in-progress';
        }

        // Increment score
        if (team === 'team1') {
            match.team1.score += 1;
        } else if (team === 'team2') {
            match.team2.score += 1;
        } else {
            return NextResponse.json({ message: 'Invalid team specified' }, { status: 400 });
        }

        // Add to score history
        match.scoreHistory.push({
            team,
            score: match[team].score,
            timestamp: new Date()
        });

        // Check if target score reached
        if (match.team1.score >= match.targetScore) {
            match.status = 'completed';
            match.winner = 'team1';
        } else if (match.team2.score >= match.targetScore) {
            match.status = 'completed';
            match.winner = 'team2';
        }

        await match.save();
        return NextResponse.json(match);
    } catch (error) {
        console.error('Error updating score:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
