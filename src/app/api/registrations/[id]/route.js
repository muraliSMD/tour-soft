import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Registration from '@/models/Registration';
import { protect } from '@/lib/auth';

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        const registration = await Registration.findById(id);

        if (!registration) {
            return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
        }

        // Only owner or creator can update
        if (registration.user.toString() !== user.id && user.role !== 'owner') {
            return NextResponse.json({ message: 'Not authorized to update this registration' }, { status: 403 });
        }

        if (registration.status !== 'pending') {
            return NextResponse.json({ message: 'Cannot update approved/rejected registrations' }, { status: 400 });
        }

        const body = await req.json();
        const { teamName, teamMembers, notes } = body;

        if (teamName) registration.teamName = teamName;
        if (teamMembers) registration.teamMembers = teamMembers;
        if (notes) registration.notes = notes;

        await registration.save();
        return NextResponse.json(registration);
    } catch (error) {
         console.error('Error updating registration:', error);
         return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        const registration = await Registration.findById(id);

        if (!registration) {
             return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
        }

        const isOwnerOrAdmin = user.role === 'owner' || user.role === 'admin';
        const isCreator = registration.user && registration.user.toString() === user.id;

        if (!isOwnerOrAdmin && !isCreator) {
             return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
        }

        await registration.deleteOne();
        return NextResponse.json({ message: 'Registration cancelled' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
