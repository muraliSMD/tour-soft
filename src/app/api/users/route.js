import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { protect, requireAdmin } from '@/lib/auth';

// GET /api/users - Get all users (Admin only)
export async function GET(req) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();

        let query = {};
        if (user.role !== 'owner') {
            query.role = { $ne: 'owner' };
        }

        const users = await User.find(query).select('-password');
        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

// POST /api/users - Create user (Admin only)
export async function POST(req) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();

        const body = await req.json();
        const { name, email, password, role } = body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'player'
        });

        if (newUser) {
            return NextResponse.json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }, { status: 201 });
        } else {
             return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
