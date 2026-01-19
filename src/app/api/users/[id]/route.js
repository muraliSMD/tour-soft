import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { protect, requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        const foundUser = await User.findById(id).select('-password');

        if (!foundUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(foundUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        const foundUser = await User.findById(id);

        if (!foundUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        
        foundUser.name = body.name || foundUser.name;
        foundUser.email = body.email || foundUser.email;
        foundUser.role = body.role || foundUser.role;
        foundUser.sports = body.sports || foundUser.sports;
        foundUser.isActive = body.isActive !== undefined ? body.isActive : foundUser.isActive;

        const updatedUser = await foundUser.save();

        return NextResponse.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            sports: updatedUser.sports,
            isActive: updatedUser.isActive
        });
    } catch (error) {
         console.error('Error updating user:', error);
         return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        const foundUser = await User.findById(id);

        if (!foundUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        await foundUser.deleteOne();
        return NextResponse.json({ message: 'User removed' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
