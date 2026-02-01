import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Academy from '@/models/Academy';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Resolve academy ID if slug is passed
    let academyId = id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const academy = await Academy.findOne({ slug: id });
        if (!academy) {
            return NextResponse.json({ success: false, error: 'Academy not found' }, { status: 404 });
        }
        academyId = academy._id;
    }

    const tournaments = await Tournament.find({ academy: academyId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: tournaments.length, data: tournaments });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
