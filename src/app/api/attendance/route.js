import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Member from '@/models/Member'; // Ensure Member is registered
import { protect } from '@/lib/auth';

export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const batch = searchParams.get('batch');
        
        if (month) {
            // Fetch for entire month
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59);

            const attendance = await Attendance.find({
                date: { $gte: startDate, $lte: endDate },
                batch
            }).populate('records.member', 'name type');

            return NextResponse.json(attendance);
        }

        if (!date) {
            return NextResponse.json({ message: 'Date or Month parameter is required' }, { status: 400 });
        }

        // Default: Single Date fetch
        const queryDate = new Date(date);
        
        // Validate Date
        if (isNaN(queryDate.getTime())) {
            return NextResponse.json({ message: 'Invalid Date format' }, { status: 400 });
        }

        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const attendance = await Attendance.findOne({
            date: { $gte: queryDate, $lt: nextDay },
            batch
        }).populate('records.member', 'name type');

        if (!attendance) {
            return NextResponse.json({ date, batch, records: [] });
        }

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const body = await req.json();
        const { date, batch, records } = body;

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        let attendance = await Attendance.findOne({
            date: { $gte: queryDate, $lt: nextDay },
            batch
        });

        if (attendance) {
            // Update existing
            attendance.records = records;
            await attendance.save();
        } else {
            // Create new
            attendance = await Attendance.create({
                date: queryDate,
                batch,
                records
            });
        }

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error saving attendance:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
