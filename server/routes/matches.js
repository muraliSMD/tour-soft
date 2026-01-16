const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOwner, requireAdmin, requireReferee } = require('../middleware/roleMiddleware');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');

// @route   GET /api/matches
// @desc    Get all matches (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let matches;
        
        if (req.user.role === 'owner') {
            // Owner sees all matches
            matches = await Match.find().populate('tournament referee', 'title name');
        } else if (req.user.role === 'admin') {
            // Admin sees matches from their tournaments
            const userTournaments = await Tournament.find({ user: req.user.id });
            const tournamentIds = userTournaments.map(t => t._id);
            matches = await Match.find({ tournament: { $in: tournamentIds } }).populate('tournament referee', 'title name');
        } else if (req.user.role === 'referee') {
            // Referee sees matches they're assigned to
            matches = await Match.find({ referee: req.user.id }).populate('tournament', 'title');
        } else {
            // Players see all matches (read-only)
            matches = await Match.find().populate('tournament referee', 'title name');
        }
        
        res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/matches/assigned
// @desc    Get matches assigned to current user (Referee)
// @access  Private
router.get('/assigned', protect, async (req, res) => {
    try {
        const matches = await Match.find({ referee: req.user._id })
            .populate('team1', 'name players')
            .populate('team2', 'name players')
            .populate('tournament', 'title')
            .sort({ date: 1 }); // Sort by date ascending
        
        res.json(matches);
    } catch (error) {
        console.error('Error fetching assigned matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tournaments/:tournamentId/matches
// @desc    Get matches for a specific tournament
// @access  Private
router.get('/tournament/:tournamentId', protect, async (req, res) => {
    try {
        const matches = await Match.find({ tournament: req.params.tournamentId })
            .populate('referee', 'name')
            .sort('matchNumber');
        res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching tournament matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/matches
// @desc    Create a new match
// @access  Private (Admin/Owner only)
router.post('/', protect, requireAdmin, async (req, res) => {
    try {
        const { tournament, matchNumber, team1, team2, targetScore } = req.body;

        if (!tournament || !matchNumber || !team1 || !team2) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const match = await Match.create({
            tournament,
            matchNumber,
            team1: { name: team1, score: 0 },
            team2: { name: team2, score: 0 },
            targetScore: targetScore || 20
        });

        res.status(201).json(match);
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/matches/:id/assign-referee
// @desc    Assign a referee to a match
// @access  Private (Admin/Owner only)
router.put('/:id/assign-referee', protect, requireAdmin, async (req, res) => {
    try {
        const { refereeId } = req.body;

        if (!refereeId) {
            return res.status(400).json({ message: 'Please provide a referee ID' });
        }

        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        match.referee = refereeId;
        await match.save();

        // Populate referee before returning
        await match.populate('referee', 'name');

        res.status(200).json(match);
    } catch (error) {
        console.error('Error assigning referee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/matches/:id/score
// @desc    Update match score (point-by-point)
// @access  Private (Referee only)
router.put('/:id/score', protect, requireReferee, async (req, res) => {
    try {
        const { team } = req.body; // 'team1' or 'team2'

        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Verify match is not completed
        if (match.status === 'completed') {
            return res.status(400).json({ message: 'Cannot score a completed match' });
        }

        // Verify referee is assigned to this match (unless owner/admin)
        if (req.user.role === 'referee' && match.referee?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not assigned to this match' });
        }

        // Update status to in-progress if it's pending
        if (match.status === 'pending') {
            match.status = 'in-progress';
        }

        // Increment score
        if (team === 'team1') {
            match.team1.score += 1;
        } else if (team === 'team2') {
            match.team2.score += 1;
        } else {
            return res.status(400).json({ message: 'Invalid team specified' });
        }

        // Add to score history
        match.scoreHistory.push({
            team,
            score: match[team].score,
            timestamp: new Date()
        });

        // Check if target score reached
        if (match.team1.score >= match.targetScore) {
            match.status = 'completed';
            match.winner = 'team1';
        } else if (match.team2.score >= match.targetScore) {
            match.status = 'completed';
            match.winner = 'team2';
        }

        await match.save();
        res.status(200).json(match);
    } catch (error) {
        console.error('Error updating score:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/matches/:id/undo
// @desc    Undo last point
// @access  Private (Referee only)
router.put('/:id/undo', protect, requireReferee, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        if (match.status === 'completed') {
            return res.status(400).json({ message: 'Cannot undo points in a completed match' });
        }

        // Verify referee assignment
        if (req.user.role === 'referee' && match.referee?.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not assigned to this match' });
        }

        if (match.scoreHistory.length === 0) {
            return res.status(400).json({ message: 'No points to undo' });
        }

        // Get last score entry
        const lastEntry = match.scoreHistory.pop();
        
        // Decrement the appropriate team's score
        if (lastEntry.team === 'team1' && match.team1.score > 0) {
            match.team1.score -= 1;
        } else if (lastEntry.team === 'team2' && match.team2.score > 0) {
            match.team2.score -= 1;
        }

        await match.save();
        res.status(200).json(match);
    } catch (error) {
        console.error('Error undoing point:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/matches/assigned
// @desc    Get matches assigned to current user (Referee)
// @access  Private
router.get('/assigned', protect, async (req, res) => {
    try {
        const matches = await Match.find({ referee: req.user._id })
            .populate('team1', 'name players')
            .populate('team2', 'name players')
            .populate('tournament', 'title')
            .sort({ date: 1 }); // Sort by date ascending
        
        res.json(matches);
    } catch (error) {
        console.error('Error fetching assigned matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/matches/:id
// @desc    Get single match
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('referee', 'name email')
            .populate('tournament', 'title game');

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        res.status(200).json(match);
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/matches/:id
// @desc    Update match details (status, winner, etc.)
// @access  Private (Admin/Owner/Referee)
router.put('/:id', protect, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Logic check: Only Owner/Admin can change everything. Referee can change status?
        // For simplicity, allowing Owner/Admin and Referee (if assigned)
        const canEdit = 
            req.user.role === 'owner' || 
            req.user.role === 'admin' || 
            (req.user.role === 'referee' && match.referee?.toString() === req.user.id);

        if (!canEdit) {
            return res.status(403).json({ message: 'Not authorized to update this match' });
        }

        const { status, winner } = req.body;

        if (status) match.status = status;
        if (winner) match.winner = winner;

        await match.save();
        res.status(200).json(match);
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/matches/:id
// @desc    Delete match
// @access  Private (Admin/Owner)
router.delete('/:id', protect, requireAdmin, async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        await match.deleteOne();
        res.status(200).json({ message: 'Match deleted successfully' });
    } catch (error) {
        console.error('Error deleting match:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
