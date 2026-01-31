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

        const registrations = await Registration.find({ tournament: id, status: 'approved' });
        
        if (registrations.length < 2) {
             return NextResponse.json({ message: 'Need at least 2 participants to start tournament' }, { status: 400 });
        }

        // Shuffle Participants
        // const participants = registrations.sort(() => Math.random() - 0.5);
        const participants = registrations; // Keep sequential for testing/user logic

        // Clear existing matches
        await Match.deleteMany({ tournament: id });

        // Create Round 1 Matches
        const matchesToCreate = [];
        let matchNum = 1;

        // Check Tournament Format
        // Use loose check to handle variations
        const isLeague = tournament.format && (tournament.format.includes('League') || tournament.format.includes('Round Robin'));
        console.log(`Tournament Format detected: ${tournament.format}, Is League? ${isLeague}`);

        if (isLeague) {
            // League Logic
            // Determine Base Pool Size based on User Rules
            // Rule 1: "if team is lessthan 11 then team count has to be 3"
            // Rule 2: "if total team is morethan 12 then pool A has 4 team" -> implies base 4
            // Rule 1: < 11 teams => Pool Size 3
            // Rule 2: > 12 teams => Min 4 Pools, Max 6 teams per pool
            
            const totalTeams = participants.length;
            let numPools = 1;

            if (totalTeams < 11) {
                // Example: 9 teams / 3 = 3 Pools
                // Example: 8 teams / 3 = 3 Pools (3,3,2)
                numPools = Math.ceil(totalTeams / 3);
            } else if (totalTeams <= 12) {
                // 11 or 12 teams. Base size 4.
                // 11/4 = 3 pools (4,4,3) - WAIT. 3 pools is < 4 pools rule for larger? 
                // Let's stick to base size 4 for this range.
                // 11/4 = 3 pools.
                // 12/4 = 3 pools.
                numPools = Math.ceil(totalTeams / 4);
            } else {
                // > 12 teams.
                // "Need to create 4 pools... max of one pool has 6 teams"
                // Implies: Try 4 pools. If size > 6, increase pools.
                // Formula: Max(4, Ceil(Total / 6))
                
                // Ex: 13 teams. Max(4, Ceil(2.1)) = 4 pools. (Teams: 4,3,3,3) OK.
                // Ex: 25 teams. Max(4, Ceil(4.1)) = 5 pools. (Teams: 5,5,5,5,5) OK.
                numPools = Math.max(4, Math.ceil(totalTeams / 6));
            }
            
            if (numPools < 1) numPools = 1;

            const poolBuckets = Array.from({ length: numPools }, () => []);

            // Distribute teams into pools (Sequential / Chunking)
            // User requirement: Teams 1-3 -> Pool A, Teams 4-6 -> Pool B
            
            // Calculate ideal size per pool (integer division)
            // We know numPools. We just fill buckets sequentially.
            // Actually, simple iteration is safest.
            
            // let currentPool = 0;
            // participants.forEach...
            
            // Better: Dynamic chunking to handle remainders evenly?
            // User's example: 9 teams, 3 pools -> 3 per pool.
            // 8 teams, 3 pools -> 3, 3, 2.
            
            // Current approach (Round Robin distribution) gave 1,4,7.
            // New approach (Sequential):
            
            /* 
              Pool 0: Indices 0, 1, 2
              Pool 1: Indices 3, 4, 5
              Pool 2: Indices 6, 7, 8
            */

             participants.forEach((participant, index) => {
                // Determine pool index based on "Rank" (index)
                 // A simple way is Math.floor(index / (total / numPools)) ? No, that handles float poorly.
                 
                 // Let's fill pools one by one.
                 // We need to know capacity of each pool.
                 // Or just distribute evenly. 
                 
                 const poolIndex = Math.floor(index / (participants.length / numPools));
                 // Edge case: if last element pushes bound? 
                 // e.g. 9 / 3 = 3. 
                 // idx 0,1,2 -> 0/3=0. 2/3=0.6 -> 0. OK.
                 // idx 3,4,5 -> 3/3=1. 5/3=1.6 -> 1. OK.
                 // idx 8 -> 8/3=2.6 -> 2. OK.
                 
                 // Check index 8/3 = 2.66. Pool 2.
                 // What if 10 teams, 3 pools (3,3,4)? 
                 // 10/3 = 3.33
                 // idx 0-3 (4 items): 0..3 / 3.33 -> 0. (Pool 0 gets 4)
                 // idx 4-6 (3 items): 4/3.33=1.2, 6/3.33=1.8 -> 1. (Pool 1 gets 3)
                 // idx 7-9 (3 items): 7/3.33=2.1 -> 2. (Pool 2 gets 3)
                 // Result: 4, 3, 3. OK.
                 
                 // Safety clamp
                 const safePoolIndex = Math.min(poolIndex, numPools - 1);
                 
                 poolBuckets[safePoolIndex].push(participant);
            });

            const pools = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'];

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
