import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id: tournamentId } = await params; // Note: 'id' matches folder name [id] inside tournaments
        const body = await req.json();
        const { teamName, teamMembers, paymentAmount } = body;

        if (!teamName || !teamMembers || !paymentAmount) {
            return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
        }

        const existingReg = await Registration.findOne({
            tournament: tournamentId,
            user: user._id
        });

        if (existingReg) {
            return NextResponse.json({ message: 'You have already registered for this tournament' }, { status: 400 });
        }

        const registration = await Registration.create({
            tournament: tournamentId,
            user: user._id,
            teamName,
            teamMembers,
            paymentAmount,
            paymentStatus: 'pending',
            status: 'pending'
        });

        return NextResponse.json(registration, { status: 201 });
    } catch (error) {
        console.error('Error creating registration:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
