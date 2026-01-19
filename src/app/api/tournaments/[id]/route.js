import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import Registration from '@/models/Registration';
import { protect } from '@/lib/auth';
import mongoose from 'mongoose';

// Ensure models are registered
import '@/models/Match';
import '@/models/Registration';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid tournament ID format' }, { status: 400 });
        }
        
        const tournament = await Tournament.findById(id);

        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        return NextResponse.json(tournament);
    } catch (error) {
        console.error('Error fetching tournament:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        let tournament = await Tournament.findById(id);

        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        // Check ownership/permissions
        if (tournament.user.toString() !== user.id && user.role !== 'owner') {
             return NextResponse.json({ message: 'Not authorized to update this tournament' }, { status: 403 });
        }

        const body = await req.json();

        tournament = await Tournament.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        return NextResponse.json(tournament);
    } catch (error) {
         console.error('Error updating tournament:', error);
         return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        
        const tournament = await Tournament.findById(id);

        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        // Check ownership/permissions
        const isOwner = user.role === 'owner';
        const isCreator = tournament.user && tournament.user.toString() === user.id;

        if (!isOwner && !isCreator) {
             return NextResponse.json({ message: 'Not authorized to delete this tournament' }, { status: 403 });
        }

        // Cascade Delete
        await Match.deleteMany({ tournament: id });
        await Registration.deleteMany({ tournament: id });
        await tournament.deleteOne();

        return NextResponse.json({ message: 'Tournament deleted successfully' });
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
