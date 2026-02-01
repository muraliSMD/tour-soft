import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Academy from '@/models/Academy';
import User from '@/models/User';
import { protect } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // id can be _id or slug

    let query = {};
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: id };
    } else {
        query = { slug: id };
    }

    const academy = await Academy.findOne(query).populate('owner', 'name email');

    if (!academy) {
      return NextResponse.json({ success: false, error: 'Academy not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: academy });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    let user;
    try {
        user = await protect(request);
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }

    let academy = await Academy.findById(id);

    if (!academy) {
      return NextResponse.json({ success: false, error: 'Academy not found' }, { status: 404 });
    }

    // Check ownership or admin rights
    let isAuthorized = academy.owner.toString() === user.id;
    
    if (!isAuthorized) {
        // Check if user is an admin of this academy
        const freshUser = await User.findById(user.id);
        const isAdmin = freshUser.associatedAcademies.some(
            a => a.academy.toString() === id && ['admin'].includes(a.role)
        );
        
        if (isAdmin) isAuthorized = true;
    }

    if (!isAuthorized) {
        return NextResponse.json({ success: false, error: 'Not authorized to update this academy' }, { status: 403 });
    }

    const reqBody = await request.json();
    academy = await Academy.findByIdAndUpdate(id, reqBody, {
      new: true,
      runValidators: true
    });

    return NextResponse.json({ success: true, data: academy });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
