
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import Tournament from '@/models/Tournament';
import User from '@/models/User';

// POST /api/public/registrations
export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { tournamentId, teamName, teamMembers, city, phone, email, password } = body;

        if (!tournamentId || !teamName || !teamMembers || teamMembers.length === 0) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check/Create User Logic
        let userId = body.userId; // Allow frontend to pass ID if they just created it
        
        if (!userId && email) {
             const normalizedEmail = email.toLowerCase();
             const existingUser = await User.findOne({ email: normalizedEmail });
             if (existingUser) {
                 userId = existingUser._id;
             }
        }


        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        if (tournament.status !== 'Draft' && tournament.status !== 'Open') {
             // Depending on rules, maybe allow late registration? For now restrict.
             // Actually 'Draft' implies not started. 'Open' implies registration open. 
             // Let's assume Draft/Open/published allows registration.
             // If completed, no.
        }

        // Check if team name exists in this tournament? 
        // Optional unique check
        const existingTeam = await Registration.findOne({ tournament: tournamentId, teamName: teamName });
        if (existingTeam) {
            return NextResponse.json({ message: 'Team name already registered' }, { status: 400 });
        }

        const registration = await Registration.create({
            tournament: tournamentId,
            teamName,
            teamMembers, // Expecting [{ name, phone, email }]
            city,
            paymentAmount: tournament.entryFee || 0,
            paymentStatus: 'pending',
            status: 'pending', 
            user: userId
        });

        return NextResponse.json(registration, { status: 201 });
    } catch (error) {
        console.error('Error in public registration:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
