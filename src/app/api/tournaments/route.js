import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import User from '@/models/User';
import { protect } from '@/lib/auth';
import '@/models/Academy'; // Ensure Academy model is registered for populate

// GET /api/tournaments
export async function GET(req) {
    try {
        const user = await protect(req);
        await connectDB();

        let tournaments;
        const { searchParams } = new URL(req.url);
        const queryUser = searchParams.get('user');

        // Filter tournaments based on user role
        if (user.role === 'owner') {
            // Owner sees ALL tournaments
            if (queryUser) {
                tournaments = await Tournament.find({ user: queryUser }).populate('academy');
            } else {
                tournaments = await Tournament.find().populate('academy');
            }
        } else if (user.role === 'admin') {
            // Admin sees only their own tournaments
            let query = { user: user.id };
            
            // If admin has sport specialization, filter by those sports too
            if (user.sports && user.sports.length > 0) {
                query.game = { $in: user.sports };
            }
            
            tournaments = await Tournament.find(query).populate('academy');
        } else {
            // Player/Referee sees ALL tournaments (read-only)
            tournaments = await Tournament.find().populate('academy');
        }

        return NextResponse.json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: error.message === 'Not authorized, token failed' ? 401 : 500 });
    }
}

// POST /api/tournaments
export async function POST(req) {
    try {
        const user = await protect(req);
        await connectDB();

        const body = await req.json();
        const { title, game, format, maxParticipants, event, academy, startDate, endDate } = body;

        if (!title || !game || !format) {
            return NextResponse.json({ message: 'Please add all required fields' }, { status: 400 });
        }

        if (game === 'Badminton' && !event) {
            return NextResponse.json({ message: 'Please select a badminton event' }, { status: 400 });
        }

        // Integrity Check: If academy is provided, verify user is an admin/owner of that academy
        if (academy) {
            // Re-fetch user with associatedAcademies populated if not available (assuming protect returns lean user)
            // But usually protect returns the full user document.
            // Let's assume user.associatedAcademies is available.
            
            // Note: If Protect middleware didn't populate associatedAcademies, we might need to fetch it.
            // But based on User model, valid user object should have it if it's in the schema.
            // However, protect usually fetches by ID. verify if associatedAcademies is fetched.
            // If strict, we should check:
             const isAuthorized = user.associatedAcademies?.some(
                a => a.academy.toString() === academy && ['owner', 'admin'].includes(a.role)
            ) || user.role === 'owner'; // Platform owner overrides

            if (!isAuthorized) {
                // Double check by fetching fresh user to be sure
                const freshUser = await User.findById(user._id);
                 const isReallyAuthorized = freshUser.associatedAcademies?.some(
                    a => a.academy.toString() === academy && ['owner', 'admin'].includes(a.role)
                ) || freshUser.role === 'owner';

                if (!isReallyAuthorized) {
                    return NextResponse.json({ message: 'Not authorized to create tournaments for this academy' }, { status: 403 });
                }
            }
        }

        const tournament = await Tournament.create({
            user: user._id, // Use _id from the protected user object
            academy, // Optional academy link
            title,
            game,
            format,
            maxParticipants,
            event: game === 'Badminton' ? event : undefined,
            startDate,
            endDate
        });

        return NextResponse.json(tournament, { status: 201 });
    } catch (error) {
        console.error('Error creating tournament:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
