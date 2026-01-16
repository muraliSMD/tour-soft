const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware'); // Ensure this is imported
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const Match = require('../models/Match');

// @route   GET /api/tournaments
// @desc    Get user tournaments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let tournaments;
        
        // Filter tournaments based on user role
        if (req.user.role === 'owner') {
            // Owner sees ALL tournaments
            // Owner sees ALL tournaments, optionally filtered by specific user (Admin)
            if (req.query.user) {
                tournaments = await Tournament.find({ user: req.query.user });
            } else {
                tournaments = await Tournament.find();
            }
        } else if (req.user.role === 'admin') {
            // Admin sees only their own tournaments
            let query = { user: req.user.id };
            
            // If admin has sport specialization, filter by those sports too
            if (req.user.sports && req.user.sports.length > 0) {
                query.game = { $in: req.user.sports };
            }
            
            tournaments = await Tournament.find(query);
        } else if (req.user.role === 'player') {
            // Player sees ALL tournaments (read-only, enforced at UI level)
            tournaments = await Tournament.find();
        } else if (req.user.role === 'referee') {
            // For now, referee sees all tournaments
            // TODO: Filter by tournaments with assigned matches
            tournaments = await Tournament.find();
        } else {
            tournaments = [];
        }
        
        res.status(200).json(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tournaments/:id
// @desc    Get single tournament
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        // Validate ObjectID format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid tournament ID format' });
        }
        
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.status(200).json(tournament);
    } catch (error) {
        console.error('Error fetching tournament:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/tournaments
// @desc    Create new tournament
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, game, format, maxParticipants, event } = req.body;

    if (!title || !game || !format) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    // Validate that event is provided for badminton tournaments
    if (game === 'Badminton' && !event) {
        return res.status(400).json({ message: 'Please select a badminton event' });
    }

    const tournament = await Tournament.create({
        user: req.user.id,
        title,
        game,
        format,
        maxParticipants,
        event: game === 'Badminton' ? event : undefined
    });

    res.status(200).json(tournament);
});

// @route   POST /api/tournaments/:id/start
// @desc    Generate bracket/matches from registrations
// @access  Private (Admin/Owner)
router.post('/:id/start', protect, requireAdmin, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // 1. Fetch Registrations (Only Approved/Confirmed ones ideally, but pending for now if no approval flow used)
        const registrations = await Registration.find({ tournament: req.params.id }); // .find({ tournament: req.params.id, status: 'approved' }); if using strict approval
        
        if (registrations.length < 2) {
             return res.status(400).json({ message: 'Need at least 2 participants to start tournament' });
        }

        // 2. Shuffle Participants
        const participants = registrations.sort(() => Math.random() - 0.5);

        // 3. Clear existing matches (optional, for regeneration)
        await Match.deleteMany({ tournament: req.params.id });

        // 4. Create Round 1 Matches
        const matchesToCreate = [];
        let matchNum = 1;

        // Simple pairing: 1 vs 2, 3 vs 4, etc.
        for (let i = 0; i < participants.length; i += 2) {
            // If odd number, last one gets a "Bye" (or handled differently, skipping for simple implementation)
            if (i + 1 < participants.length) {
                const team1 = participants[i];
                const team2 = participants[i+1];

                matchesToCreate.push({
                    tournament: req.params.id,
                    matchNumber: matchNum++,
                    team1: { name: team1.teamName, score: 0 },
                    team2: { name: team2.teamName, score: 0 },
                    targetScore: 21, // Default for badminton/generic
                    status: 'pending',
                    round: 1 // Add round info if Schema supported it
                });
            } else {
                // Handle Bye - maybe create a completed match with winner?
                // For now, ignore odd participant or create a dummy match
                console.log(`Participant ${participants[i].teamName} gets a bye (not implemented)`);
            }
        }

        const createdMatches = await Match.insertMany(matchesToCreate);

        // 5. Update Tournament Status
        tournament.status = 'Active';
        await tournament.save();

        res.status(200).json({ message: 'Tournament started', matches: createdMatches });

    } catch (error) {
        console.error('Error generating bracket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   PUT /api/tournaments/:id
// @desc    Update tournament details
// @access  Private (Admin/Owner)
router.put('/:id', protect, async (req, res) => {
    try {
        let tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check ownership/permissions
        if (tournament.user.toString() !== req.user.id && req.user.role !== 'owner') {
             return res.status(403).json({ message: 'Not authorized to update this tournament' });
        }

        tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(tournament);
    } catch (error) {
        console.error('Error updating tournament:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament and all associated data
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check ownership/permissions
        // Owner (Super Admin) can delete anything.
        // Admin (Academy) can only delete their own.
        const isOwner = req.user.role === 'owner';
        const isCreator = tournament.user && tournament.user.toString() === req.user.id;

        if (!isOwner && !isCreator) {
             return res.status(403).json({ message: 'Not authorized to delete this tournament' });
        }

        // Cascade Delete
        await Match.deleteMany({ tournament: req.params.id });
        await Registration.deleteMany({ tournament: req.params.id });
        await tournament.deleteOne();

        res.status(200).json({ message: 'Tournament deleted successfully' });
    } catch (error) {
        console.error('Error deleting tournament:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
