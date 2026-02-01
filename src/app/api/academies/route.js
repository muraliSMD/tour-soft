import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Academy from '@/models/Academy';
import User from '@/models/User';
import { protect } from '@/lib/auth';

// GET /api/academies
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('public');

    await connectDB();
    
    let user;
    try {
        user = await protect(request);
    } catch (e) {
        // Not logged in
    }

    let query = {};

    if (user) {
         if (user.role === 'owner') {
            // Platform owner sees all
            query = {}; 
        } else {
            // Admin/Referee: Show associated
            // Actually, if a user is logged in, should we show "My Academies" OR "All Academies"?
            // Usually dashboard calls this to get "My Academies".
            
            const userWithAssociations = await User.findById(user._id).select('associatedAcademies');
            const academyIds = userWithAssociations?.associatedAcademies?.map(a => a.academy) || [];
            
            query = {
                $or: [
                    { owner: user._id },
                    { _id: { $in: academyIds } }
                ]
            };
        }
    } else {
        // Unauthenticated User (Player/Guest)
        // If 'public' param is true, or just default to showing all public academies?
        // Let's assume the "Academy Directory" page needs ALL academies.
        // We filter by 'isVerified' if we want to be strict, but let's show all for now.
        query = {};
    }

    // Apply strict selection for public feed to avoid leaking sensitive internal fields (if any)
    const academies = await Academy.find(query)
      .select('name slug logo location sports isVerified owner description gallery bannerImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, count: academies.length, data: academies });
  } catch (error) {
     return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const user = await protect(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }

    // Strict Check: Only platform 'desc' or 'owner' can create academies
    // Here we use 'owner' as the platform level role
    if (user.role !== 'owner') {
        return NextResponse.json({ success: false, error: 'Only platform owners can create academies' }, { status: 403 });
    }

    const reqBody = await request.json();

    // Add user as owner
    reqBody.owner = user.id;

    // Generate slug manually
    if (reqBody.name) {
        reqBody.slug = reqBody.name.toLowerCase().split(' ').join('-');
    }

    const academy = await Academy.create(reqBody);

    // Update user to be owner of this academy
    await User.findByIdAndUpdate(user.id, {
      $push: {
        associatedAcademies: {
          academy: academy._id,
          role: 'owner'
        }
      }
    });

    return NextResponse.json({ success: true, data: academy }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Academy with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
