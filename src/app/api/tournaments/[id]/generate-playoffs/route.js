import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Match from '@/models/Match';
import Tournament from '@/models/Tournament';
import { protect, requireAdmin } from '@/lib/auth';

export async function POST(req, { params }) {
    try {
        const user = await protect(req);
        requireAdmin(user);
        await connectDB();
        
        const { id } = await params;
        const tournament = await Tournament.findById(id);

        if (!tournament) {
            return NextResponse.json({ message: 'Tournament not found' }, { status: 404 });
        }

        // CHECK PROGRESSION LEVEL

        // Check if Final exists (Round 3)
        const existingFinal = await Match.findOne({ tournament: id, round: 3 });
        if (existingFinal) {
            return NextResponse.json({ message: 'Final match already generated.' }, { status: 400 });
        }

        // Check if Semi-Finals exist (Round 2)
        const semiFinals = await Match.find({ tournament: id, round: 2 });
        
        if (semiFinals.length > 0) {
            // ---> SEMI FINAL TO FINAL LOGIC
            const completedSemis = semiFinals.filter(m => m.status === 'completed' && m.winner);
            
            if (completedSemis.length < 2) {
                 return NextResponse.json({ message: 'Semi-Finals in progress. Please complete them first.' }, { status: 400 });
            }

            // Create Final
            const finalMatch = {
                tournament: id,
                matchNumber: semiFinals[semiFinals.length-1].matchNumber + 1,
                team1: { name: completedSemis[0].winner === 'team1' ? completedSemis[0].team1.name : completedSemis[0].team2.name, score: 0 },
                team2: { name: completedSemis[1].winner === 'team1' ? completedSemis[1].team1.name : completedSemis[1].team2.name, score: 0 },
                targetScore: 21,
                status: 'pending',
                round: 3,
                type: 'Knockout',
                group: 'Final'
            };

            await Match.create(finalMatch);
            return NextResponse.json({ message: 'Final match generated', matches: [finalMatch] });
        }

        // ---> LEAGUE TO SEMI FINAL LOGIC (Existing)
        const matches = await Match.find({ tournament: id, type: 'League', status: 'completed' });

        if (matches.length === 0) {
            return NextResponse.json({ message: 'No completed league matches found. Cannot generate playoffs.' }, { status: 400 });
        }

        // 2. Calculate Standings Per Group
        const groups = {};
        
        matches.forEach(match => {
            const groupName = match.group;
            if (!groups[groupName]) groups[groupName] = {};

            const processTeam = (teamName, isWinner) => {
                if (!groups[groupName][teamName]) {
                    groups[groupName][teamName] = { name: teamName, points: 0, won: 0, played: 0 };
                }
                groups[groupName][teamName].played += 1;
                if (isWinner) {
                    groups[groupName][teamName].points += 2;
                    groups[groupName][teamName].won += 1;
                }
            };

            if (match.winner) {
                processTeam(match.team1.name, match.winner === 'team1');
                processTeam(match.team2.name, match.winner === 'team2');
            }
        });

        // Convert to sorted arrays
        const poolStandings = {};
        Object.keys(groups).forEach(groupName => {
            poolStandings[groupName] = Object.values(groups[groupName]).sort((a, b) => b.points - a.points || b.won - a.won);
        });

        // 3. Select Qualifiers
        const poolWinners = [];
        const poolRunnersUp = [];

        Object.keys(poolStandings).forEach(groupName => {
            const standings = poolStandings[groupName];
            if (standings.length > 0) poolWinners.push({ ...standings[0], group: groupName });
            if (standings.length > 1) poolRunnersUp.push({ ...standings[1], group: groupName });
        });

        // Determine who advances
        // Target: 4 Semi-Finalists
        let semiFinalists = [...poolWinners];

        // If 3 pools -> 3 winners. Need 1 more.
        if (semiFinalists.length === 3) {
            // Find best runner up
            poolRunnersUp.sort((a, b) => b.points - a.points || b.won - a.won);
            if (poolRunnersUp.length > 0) {
                semiFinalists.push(poolRunnersUp[0]);
            }
        } else if (semiFinalists.length > 4) {
             // If > 4 pools (e.g. 5 pools), take top 4 winners based on stats? 
             // Or maybe Quarter finals needed. 
             // User only specified "Semi final" for 3 pool scenario.
             // For > 12 teams (4 pools) -> 4 winners -> Semis. OK.
             // For 5 pools... tricky. Let's assume top 4 winners advance for now or error.
             if (semiFinalists.length > 4) {
                semiFinalists.sort((a, b) => b.points - a.points || b.won - a.won);
                semiFinalists = semiFinalists.slice(0, 4);
             }
        }
        
        // If still not 4, we might have an issue (e.g. only 2 pools -> Final directly?)
        // Assuming 4 for now as per user requirement for "Semi Final"
        
        if (semiFinalists.length < 4) {
             return NextResponse.json({ message: `Not enough teams to generate Semi-Finals (Found ${semiFinalists.length}). Need at least 4.` }, { status: 400 });
        }

        // 4. Seed Teams (Rank 1 to 4)
        semiFinalists.sort((a, b) => b.points - a.points || b.won - a.won);
        
        // Rank 1: semiFinalists[0]
        // Rank 2: semiFinalists[1]
        // Rank 3: semiFinalists[2]
        // Rank 4: semiFinalists[3]

        // 5. Generate Matches
        // User Rule: "Top 1 and Top 3 has to play" -> Seed 1 vs Seed 3
        // User Rule: "Remaining two team has to play" -> Seed 2 vs Seed 4
        
        // Match A: 1 vs 3
        // Match B: 2 vs 4
        // Winners go to Final.
        
        // Find existing max match number
        const lastMatch = await Match.findOne({ tournament: id }).sort({ matchNumber: -1 });
        let nextMatchNum = lastMatch ? lastMatch.matchNumber + 1 : 1;

        const sfMatches = [
            {
                tournament: id,
                matchNumber: nextMatchNum++,
                team1: { name: semiFinalists[0].name, score: 0 },
                team2: { name: semiFinalists[2].name, score: 0 },
                targetScore: 21, // Customisable?
                status: 'pending',
                round: 2, // Semi Final
                type: 'Knockout',
                group: 'Semi Final 1'
            },
            {
                tournament: id,
                matchNumber: nextMatchNum++,
                team1: { name: semiFinalists[1].name, score: 0 },
                team2: { name: semiFinalists[3].name, score: 0 },
                targetScore: 21,
                status: 'pending',
                round: 2, // Semi Final
                type: 'Knockout',
                group: 'Semi Final 2'
            }
        ];

        await Match.insertMany(sfMatches);

        return NextResponse.json({ message: 'Semi-Finals generated', matches: sfMatches });

    } catch (error) {
        console.error('Error generating playoffs:', error);
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
    }
}
