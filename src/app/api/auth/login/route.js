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
        const { email, password } = body;
        const normalizedEmail = email.toLowerCase();
        
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isActive === false) {
                return NextResponse.json({ message: 'Account is disabled. Please contact your administrator.' }, { status: 403 });
            }
            
            return NextResponse.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                sports: user.sports,
                token: generateToken(user._id)
            });
        } else {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
