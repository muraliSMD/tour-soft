import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect } from '@/lib/auth';

// Ensure models for population
import '@/models/Tournament';

// GET /api/registrations (My Registrations)
export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const registrations = await Registration.find({ user: user._id })
            .populate('tournament', 'title game startDate')
            .sort('-createdAt');
            
        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
