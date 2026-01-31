
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect } from '@/lib/auth';

// Ensure models are registered
import '@/models/Tournament';

export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const registrations = await Registration.find({ user: user._id })
            .populate('tournament', 'title game startDate entryFee')
            .sort('-createdAt');

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('Error fetching player registrations:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
