import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { protect } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        await connectDB();
        
        const { id } = await params;
        const member = await Member.findById(id);

        if (!member) {
            return NextResponse.json({ message: 'Member not found' }, { status: 404 });
        }

        const body = await req.json();
        const { month, amount, status } = body;

        // Check if fee for month already exists
        const feeIndex = member.fees.findIndex(f => f.month === month);

        if (feeIndex > -1) {
            // Update existing
            member.fees[feeIndex].amount = amount;
            member.fees[feeIndex].status = status;
            if (status === 'paid') member.fees[feeIndex].paidDate = new Date();
        } else {
            // Add new
            member.fees.push({
                month,
                amount,
                status,
                paidDate: status === 'paid' ? new Date() : null
            });
        }

        await member.save();
        return NextResponse.json(member);
    } catch (error) {
        console.error('Error adding fee:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
