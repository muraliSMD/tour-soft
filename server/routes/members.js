const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Member = require('../models/Member');

// @route   GET /api/members
// @desc    Get members
// @access  Private (Owner/Admin)
router.get('/', protect, async (req, res) => {
    try {
        let members;
        
        if (req.user.role === 'owner') {
             // Owner sees all, or filtered by user (Admin)
             if (req.query.user) {
                 members = await Member.find({ user: req.query.user }).sort({ name: 1 });
             } else {
                 members = await Member.find().sort({ name: 1 });
             }
        } else {
            // Admin/Others see only their own members
            members = await Member.find({ user: req.user.id }).sort({ name: 1 });
        }
        
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/members
// @desc    Add new member
// @access  Private (Owner/Admin)
router.post('/', protect, async (req, res) => {
    try {
        const { name, email, phone, type, batch, category, joiningDate, notes } = req.body;

        const member = await Member.create({
            user: req.user.id,
            name,
            email,
            phone,
            type,
            batch,
            category,
            joiningDate,
            notes
        });

        res.status(201).json(member);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/members/:id
// @desc    Get member details
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const { name, email, phone, type, batch, category, status, notes } = req.body;

        if (name) member.name = name;
        if (email) member.email = email;
        if (phone) member.phone = phone;
        if (type) member.type = type;
        if (batch) member.batch = batch;
        if (category) member.category = category;
        if (status) member.status = status;
        if (notes !== undefined) member.notes = notes;

        await member.save();
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/members/:id/fees
// @desc    Add fee record
// @access  Private
router.post('/:id/fees', protect, async (req, res) => {
    try {
        const { month, amount, status } = req.body;
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Check if fee for month already exists
        const feeIndex = member.fees.findIndex(f => f.month === month);

        if (feeIndex > -1) {
            // Update existing
            member.fees[feeIndex].amount = amount;
            member.fees[feeIndex].status = status;
            if (status === 'paid') member.fees[feeIndex].paidDate = new Date();
        } else {
            // Add new
            member.fees.push({
                month,
                amount,
                status,
                paidDate: status === 'paid' ? new Date() : null
            });
        }

        await member.save();
        res.json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        
        // Permission check
        const isOwner = req.user.role === 'owner';
        const isCreator = member.user.toString() === req.user.id;

        if (!isOwner && !isCreator) {
             return res.status(403).json({ message: 'Not authorized to delete this member' });
        }
        
        await member.deleteOne();
        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
