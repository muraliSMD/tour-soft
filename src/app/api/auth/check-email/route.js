
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        return NextResponse.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking email:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
