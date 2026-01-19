import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect, requireAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id: tournamentId } = await params;
        const body = await req.json();
        const { teamName, teamMembers, paymentAmount, city } = body;

        if (!teamName || !teamMembers) {
            return NextResponse.json({ message: 'Please provide team name and members' }, { status: 400 });
        }

        const registration = await Registration.create({
            tournament: tournamentId,
            // User is optional for manual entry
            teamName,
            teamMembers,
            city,
            paymentAmount: paymentAmount || 0,
            paymentStatus: 'pending',
            status: 'approved' // Auto-approve manual adds
        });

        return NextResponse.json(registration, { status: 201 });
    } catch (error) {
        console.error('Error creating manual registration:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
