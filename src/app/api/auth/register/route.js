import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export async function POST(req) {
    try {
        await connectDB();
        
        const body = await req.json();
        const { name, email, password, role, creatorRole, sports } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Please include all fields' }, { status: 400 });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // Role validation logic (ported from Express)
        const requestedRole = role || 'player';

        if (requestedRole !== 'player') {
            if (!creatorRole) {
                 return NextResponse.json({ message: 'Cannot create accounts with elevated roles without authorization' }, { status: 403 });
            }
            
            if (creatorRole === 'owner') {
                // Allowed
            } else if (creatorRole === 'admin' && ['referee', 'player'].includes(requestedRole)) {
                // Allowed
            } else {
                 return NextResponse.json({ message: 'You do not have permission to create this role' }, { status: 403 });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: requestedRole,
            sports: sports || []
        });

        if (user) {
            return NextResponse.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                sports: user.sports,
                token: generateToken(user._id)
            }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Invalid user data' }, { status: 400 });
        }

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
