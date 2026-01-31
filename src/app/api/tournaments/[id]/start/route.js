import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Match from '@/models/Match';
import Registration from '@/models/Registration';
import { protect, requireAdmin } from '@/lib/auth';

// Ensure models are registered
import '@/models/Match';
import '@/models/Registration';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user); // Enforce admin role
        await connectDB();
        
        const { id } = await params;

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        const registrations = await Registration.find({ tournament: id });
        
        if (registrations.length < 2) {
             return NextResponse.json({ message: 'Need at least 2 participants to start tournament' }, { status: 400 });
        }

        // Shuffle Participants
        const participants = registrations.sort(() => Math.random() - 0.5);

        // Clear existing matches
        await Match.deleteMany({ tournament: id });

        // Create Round 1 Matches
        const matchesToCreate = [];
        let matchNum = 1;

        // Check Tournament Format
        if (tournament.format === 'League Tournament (Round Robin)') {
            // League Logic
            const pools = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'];
            
            // Logic: Teams are split into pools of 4. Remaining teams go to Pool A.
            // Example: 12 teams -> 3 pools (A, B, C) of 4.
            // Example: 16 teams -> 4 pools (A, B, C, D) of 4.
            // Example: 13 teams -> 3 pools. A gets 5, B gets 4, C gets 4. wait, user said "add remaining team in it in pool A"

             // Calculate base number of pools (assuming base size of 4)
             let numPools = Math.floor(participants.length / 4);
             if (numPools < 1) numPools = 1; // Minimum 1 pool

             const poolBuckets = Array.from({ length: numPools }, () => []);

             // Distribute first (numPools * 4) teams evenly
             let pIndex = 0;
             for (let i = 0; i < numPools; i++) {
                 for (let j = 0; j < 4; j++) {
                     if (pIndex < participants.length) {
                         poolBuckets[i].push(participants[pIndex++]);
                     }
                 }
             }

             // Put remaining teams into Pool A (index 0)
             while (pIndex < participants.length) {
                 poolBuckets[0].push(participants[pIndex++]);
             }

             // Generate Round Robin Matches for each Pool
             poolBuckets.forEach((poolParticipants, poolIndex) => {
                 const groupName = pools[poolIndex] || `Group ${poolIndex + 1}`;
                 
                 // Round Robin Algorithm
                 for (let i = 0; i < poolParticipants.length; i++) {
                     for (let j = i + 1; j < poolParticipants.length; j++) {
                         matchesToCreate.push({
                             tournament: id,
                             matchNumber: matchNum++,
                             team1: { name: poolParticipants[i].teamName, score: 0 },
                             team2: { name: poolParticipants[j].teamName, score: 0 },
                             targetScore: 21,
                             status: 'pending',
                             round: 1, // League Stage
                             group: groupName,
                             type: 'League'
                         });
                     }
                 }
             });

        } else {
            // Default: Simple Single Elimination / Knockout (Current Logic)
             for (let i = 0; i < participants.length; i += 2) {
                if (i + 1 < participants.length) {
                    const team1 = participants[i];
                    const team2 = participants[i+1];

                    matchesToCreate.push({
                        tournament: id,
                        matchNumber: matchNum++,
                        team1: { name: team1.teamName, score: 0 },
                        team2: { name: team2.teamName, score: 0 },
                        targetScore: 21,
                        status: 'pending',
                        round: 1,
                        type: 'Knockout'
                    });
                } else {
                    console.log(`Participant ${participants[i].teamName} gets a bye (not implemented)`);
                    // Ideally, create a bye match or auto-advance
                }
            }
        }

        const createdMatches = await Match.insertMany(matchesToCreate);

        // Update Tournament Status
        tournament.status = 'Active';
        await tournament.save();

        return NextResponse.json({ message: 'Tournament started', matches: createdMatches });

    } catch (error) {
        console.error('Error generating bracket:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
