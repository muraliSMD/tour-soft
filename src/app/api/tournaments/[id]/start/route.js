import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import Registration from '@/models/Registration';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models are registered
import '@/models/Match';
import '@/models/Registration';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user); // Enforce admin role
        await connectDB();
        
        const { id } = await params;

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        const registrations = await Registration.find({ tournament: id });
        
        if (registrations.length < 2) {
             return NextResponse.json({ message: 'Need at least 2 participants to start tournament' }, { status: 400 });
        }

        // Shuffle Participants
        const participants = registrations.sort(() => Math.random() - 0.5);

        // Clear existing matches
        await Match.deleteMany({ tournament: id });

        // Create Round 1 Matches
        const matchesToCreate = [];
        let matchNum = 1;

        for (let i = 0; i < participants.length; i += 2) {
            if (i + 1 < participants.length) {
                const team1 = participants[i];
                const team2 = participants[i+1];

                matchesToCreate.push({
                    tournament: id,
                    matchNumber: matchNum++,
                    team1: { name: team1.teamName, score: 0 },
                    team2: { name: team2.teamName, score: 0 },
                    targetScore: 21,
                    status: 'pending',
                    round: 1
                });
            } else {
                console.log(`Participant ${participants[i].teamName} gets a bye (not implemented)`);
            }
        }

        const createdMatches = await Match.insertMany(matchesToCreate);

        // Update Tournament Status
        tournament.status = 'Active';
        await tournament.save();

        return NextResponse.json({ message: 'Tournament started', matches: createdMatches });

    } catch (error) {
        console.error('Error generating bracket:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
