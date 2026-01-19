import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { protect } from '@/lib/auth';

// GET /api/members
export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        let members;
        const { searchParams } = new URL(req.url);
        const queryUser = searchParams.get('user');
        
        if (user.role === 'owner') {
             // Owner sees all, or filtered by user (Admin)
             if (queryUser) {
                 members = await Member.find({ user: queryUser }).sort({ name: 1 });
             } else {
                 members = await Member.find().sort({ name: 1 });
             }
        } else {
            // Admin/Others see only their own members
            members = await Member.find({ user: user.id }).sort({ name: 1 });
        }
        
        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

// POST /api/members
export async function POST(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const body = await req.json();
        const { name, email, phone, type, batch, category, joiningDate, notes } = body;

        const member = await Member.create({
            user: user.id,
            name,
            email,
            phone,
            type,
            batch,
            category,
            joiningDate,
            notes
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Error creating member:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
