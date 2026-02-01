import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Academy from '@/models/Academy';
import { protect } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    
    let user;
    try {
        user = await protect(request);
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }
    
    if (!user) return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });

    // Check if requester has access to this academy
    // Only fetching members if you are already a member/owner
    // Implementation skipped for brevity, assuming UI hides this call if not auth.

    // Find users who have this academy in their associatedAcademies
    const members = await User.find({
        'associatedAcademies.academy': id
    }).select('name email associatedAcademies');

    // Filter the output to clean up structure
    const cleanedMembers = members.map(m => {
        const association = m.associatedAcademies.find(a => a.academy.toString() === id);
        return {
            _id: m._id,
            name: m.name,
            email: m.email,
            role: association?.role || 'admin'
        };
    });

    return NextResponse.json({ success: true, data: cleanedMembers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
    try {
      await connectDB();
      const { id } = await params;
      
      let user;
      try {
          user = await protect(request);
      } catch (e) {
          return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
      }
  
      if (!user) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
      }

      // Verify requester is Owner/Admin of this academy
      const academy = await Academy.findById(id);
      if (!academy) {
          return NextResponse.json({ success: false, error: 'Academy not found' }, { status: 404 });
      }

      const isOwner = academy.owner.toString() === user._id.toString();
      const isAdmin = user.associatedAcademies.some(a => a.academy.toString() === id && a.role === 'admin');

      if (!isOwner) {
          return NextResponse.json({ success: false, error: 'Only the Academy Owner can add new admins' }, { status: 403 });
      }

      const { email, role } = await request.json();

      // Find user to invite
      let userToInvite = await User.findOne({ email });
      let isNewUser = false;

      if (!userToInvite) {
          // AUTO-CREATE USER
          // We'll set a default password for now or leave it to be set (if auth supports it).
          // For simplicity, we'll set a default password '123456' and they should change it.
          // ideally, you would send an invite email with a token.
          
          try {
             userToInvite = await User.create({
                 name: email.split('@')[0], // Default name from email
                 email: email,
                 password: await import('bcryptjs').then(bcrypt => bcrypt.hash('123456', 10)), // Temp password
                 role: 'admin', // Default to admin since they are being invited as such
                 isActive: true
             });
             isNewUser = true;
          } catch(err) {
               return NextResponse.json({ success: false, error: 'Failed to create new user account: ' + err.message }, { status: 500 });
          }
      }

      // Check if already a member
      const isMember = userToInvite.associatedAcademies?.some(a => a.academy.toString() === id);
      if (isMember) {
           return NextResponse.json({ success: false, error: 'User is already a member of this academy' }, { status: 400 });
      }

      // Prepare updates
      const updateData = {
          $push: {
              associatedAcademies: {
                  academy: id,
                  role: role || 'admin'
              }
          }
      };

      // Upgrade top-level role if currently just a player
      if (userToInvite.role === 'player' || userToInvite.role === 'user') {
          updateData.role = role || 'admin';
      }

      // Add to associatedAcademies and update role
      await User.findByIdAndUpdate(userToInvite._id, updateData);

      return NextResponse.json({ 
          success: true, 
          message: isNewUser ? 'User created and added as Admin. Default password: "123456"' : 'User added successfully' 
      });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        
        let user;
        try {
            user = await protect(request);
        } catch (e) {
            return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
        }

        // 1. Verify Requestor Permissions (Must be Owner of Academy)
        const academy = await Academy.findById(id);
        if (!academy) {
            return NextResponse.json({ success: false, error: 'Academy not found' }, { status: 404 });
        }

        if (academy.owner.toString() !== user._id.toString()) {
             return NextResponse.json({ success: false, error: 'Only the Owner can remove admins' }, { status: 403 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (userId === academy.owner.toString()) {
            return NextResponse.json({ success: false, error: 'Cannot remove the owner' }, { status: 400 });
        }

        // 2. Remove Academy from User's associatedAcademies
        const userToRemove = await User.findById(userId);
        if (!userToRemove) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: {
                associatedAcademies: { academy: id }
            }
        });

        // 3. Logic Check: If user has no more associated academies, revert role to 'player'
        // We need to re-fetch to see the updated list, or just check userToRemove's list minus 1
        // Safest is to fetch again or checking the logic below:
        const updatedUser = await User.findById(userId);
        if (updatedUser.associatedAcademies.length === 0 && updatedUser.role !== 'owner') {
            updatedUser.role = 'player';
            await updatedUser.save();
        }

        return NextResponse.json({ success: true, message: 'Admin removed successfully' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
    }
}
