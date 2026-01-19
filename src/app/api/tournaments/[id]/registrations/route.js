import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models
import '@/models/User';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id: tournamentId } = await params;

        const registrations = await Registration.find({ tournament: tournamentId })
            .populate('user', 'name email')
            .sort('-createdAt');
            
        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching tournament registrations:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
