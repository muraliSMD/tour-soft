import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect, requireAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        
        const registration = await Registration.findById(id);

        if (!registration) {
            return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
        }

        registration.status = 'approved';
        await registration.save();
        return NextResponse.json(registration);
    } catch (error) {
         console.error('Error approving registration:', error);
         return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
