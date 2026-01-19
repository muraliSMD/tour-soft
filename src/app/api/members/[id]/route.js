import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { protect } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json(member);
    } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        const body = await req.json();
        const { name, email, phone, type, batch, category, status, notes } = body;

        if (name) member.name = name;
        if (email) member.email = email;
        if (phone) member.phone = phone;
        if (type) member.type = type;
        if (batch) member.batch = batch;
        if (category) member.category = category;
        if (status) member.status = status;
        if (notes !== undefined) member.notes = notes;

        await member.save();
        return NextResponse.json(member);
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }
        
        // Permission check
        const isOwner = user.role === 'owner';
        const isCreator = member.user.toString() === user.id;

        if (!isOwner && !isCreator) {
             return NextResponse.json({ message: 'Not authorized to delete this member' }, { status: 403 });
        }
        
        await member.deleteOne();
        return NextResponse.json({ message: 'Member removed' });
    } catch (error) {
         console.error('Error deleting member:', error);
         return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
