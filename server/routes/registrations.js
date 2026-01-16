const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireOwner, requireAdmin } = require('../middleware/roleMiddleware');
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');

// @route   GET /api/registrations
// @desc    Get player's registrations
// @access  Private (Player)
router.get('/', protect, async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id })
            .populate('tournament', 'title game startDate')
            .sort('-createdAt');
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tournaments/:id/registrations
// @desc    Get all registrations for a tournament
// @access  Private (Admin/Owner only)
router.get('/tournament/:tournamentId', protect,  requireAdmin, async (req, res) => {
    try {
        const registrations = await Registration.find({ tournament: req.params.tournamentId })
            .populate('user', 'name email')
            .sort('-createdAt');
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching tournament registrations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tournaments/:id/register
// @desc    Register team for tournament
// @access  Private (Player)
router.post('/tournament/:tournamentId/register', protect, async (req, res) => {
    try {
        const { teamName, teamMembers, paymentAmount } = req.body;

        if (!teamName || !teamMembers || !paymentAmount) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if user already registered for this tournament
        const existingReg = await Registration.findOne({
            tournament: req.params.tournamentId,
            user: req.user.id
        });

        if (existingReg) {
            return res.status(400).json({ message: 'You have already registered for this tournament' });
        }

        const registration = await Registration.create({
            tournament: req.params.tournamentId,
            user: req.user.id,
            teamName,
            teamMembers,
            paymentAmount,
            paymentStatus: 'pending',
            status: 'pending'
        });

        res.status(201).json(registration);
    } catch (error) {
        console.error('Error creating registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tournaments/:id/manual-register
// @desc    Manually add participant (Admin/Owner)
// @access  Private (Admin/Owner)
router.post('/tournament/:tournamentId/manual-register', protect, requireAdmin, async (req, res) => {
    try {
        const { teamName, teamMembers, paymentAmount } = req.body;

        if (!teamName || !teamMembers) {
            return res.status(400).json({ message: 'Please provide team name and members' });
        }

        const registration = await Registration.create({
            tournament: req.params.tournamentId,
            // User is optional now
            teamName,
            teamMembers,
            city: req.body.city,
            paymentAmount: paymentAmount || 0,
            paymentStatus: 'pending', // Or 'completed' if admin checks it? Let's default pending
            status: 'approved' // Auto-approve manual adds
        });

        res.status(201).json(registration);
    } catch (error) {
        console.error('Error creating manual registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/registrations/:id
// @desc    Update registration (before approval)
// @access  Private (Player)
router.put('/:id', protect, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Only the owner or the player who created it can update
        if (registration.user.toString() !== req.user.id && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Not authorized to update this registration' });
        }

        // Can only update if still pending
        if (registration.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot update approved/rejected registrations' });
        }

        const { teamName, teamMembers, notes } = req.body;

        if (teamName) registration.teamName = teamName;
        if (teamMembers) registration.teamMembers = teamMembers;
        if (notes) registration.notes = notes;

        await registration.save();
        res.status(200).json(registration);
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/registrations/:id
// @desc    Cancel registration
// @access  Private (Player)
router.delete('/:id', protect, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions:
        // 1. Owner can delete anything.
        // 2. Admin can delete anything (since they manage the tournament).
        // 3. User can delete their own registration.
        
        const isOwnerOrAdmin = req.user.role === 'owner' || req.user.role === 'admin';
        const isCreator = registration.user && registration.user.toString() === req.user.id;

        if (!isOwnerOrAdmin && !isCreator) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await registration.deleteOne();
        res.status(200).json({ message: 'Registration cancelled' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/registrations/:id/approve
// @desc    Approve registration
// @access  Private (Admin/Owner only)
router.put('/:id/approve', protect, requireAdmin, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.status = 'approved';
        await registration.save();

        res.status(200).json(registration);
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/registrations/:id/reject
// @desc    Reject registration
// @access  Private (Admin/Owner only)
router.put('/:id/reject', protect, requireAdmin, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.status = 'rejected';
        await registration.save();

        res.status(200).json(registration);
    } catch (error) {
        console.error('Error rejecting registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/registrations/:id/mark-paid
// @desc    Manually mark payment as completed (offline payment)
// @access  Private (Admin/Owner only)
router.put('/:id/mark-paid', protect, requireAdmin, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const { notes } = req.body;

        registration.paymentStatus = 'completed';
        registration.paymentMethod = 'manual';
        registration.paidBy = req.user.name;
        registration.paidAt = new Date();
        if (notes) registration.notes = notes;

        await registration.save();

        res.status(200).json(registration);
    } catch (error) {
        console.error('Error marking payment as paid:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/registrations/:id/payment/online
// @desc    Process online payment (Stripe/Razorpay integration point)
// @access  Private (Player)
router.post('/:id/payment/online', protect, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (registration.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // TODO: Integrate with payment gateway (Stripe/Razorpay)
        // For now, returning a placeholder payment URL
        const paymentUrl = `https://payment-gateway.com/pay?amount=${registration.paymentAmount}&ref=${registration._id}`;

        res.status(200).json({
            paymentUrl,
            amount: registration.paymentAmount,
            registrationId: registration._id
        });
    } catch (error) {
        console.error('Error initiating online payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/registrations/payment/webhook
// @desc    Payment webhook for online payments
// @access  Public (called by payment gateway)
router.post('/payment/webhook', async (req, res) => {
    try {
        // TODO: Verify webhook signature from payment gateway
        const { registrationId, transactionId, status } = req.body;

        const registration = await Registration.findById(registrationId);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (status === 'success') {
            registration.paymentStatus = 'completed';
            registration.paymentMethod = 'online';
            registration.transactionId = transactionId;
            registration.paidAt = new Date();
            await registration.save();
        } else {
            registration.paymentStatus = 'failed';
            await registration.save();
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Error processing payment webhook:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
