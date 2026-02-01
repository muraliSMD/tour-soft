import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';

export async function GET(req, { params }) {
    try {
        await connectDB();
        
        const { id: tournamentId } = await params;

        const registrations = await Registration.find({ tournament: tournamentId })
            .select('teamName teamMembers.name');
            
        return NextResponse.json({ success: true, data: registrations });
    } catch (error) {
        console.error('Error fetching tournament teams:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
