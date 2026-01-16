const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');

// @route   GET /api/attendance
// @desc    Get attendance for date and batch
// @access  Private
// @route   GET /api/attendance
// @desc    Get attendance for date (single day) or month (range)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { date, month, batch } = req.query;
        
        if (month) {
            // Fetch for entire month
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59);

            const attendance = await Attendance.find({
                date: { $gte: startDate, $lte: endDate },
                batch
            }).populate('records.member', 'name type');

            return res.json(attendance);
        }

        if (!date) {
            return res.status(400).json({ message: 'Date or Month parameter is required' });
        }

        // Default: Single Date fetch
        const queryDate = new Date(date);
        
        // Validate Date
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid Date format' });
        }

        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const attendance = await Attendance.findOne({
            date: { $gte: queryDate, $lt: nextDay },
            batch
        }).populate('records.member', 'name type');

        if (!attendance) {
            return res.json({ date, batch, records: [] });
        }

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/attendance
// @desc    Save attendance
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { date, batch, records } = req.body;

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);

        let attendance = await Attendance.findOne({
            date: { $gte: queryDate, $lt: nextDay },
            batch
        });

        if (attendance) {
            // Update existing
            attendance.records = records;
            await attendance.save();
        } else {
            // Create new
            attendance = await Attendance.create({
                date: queryDate,
                batch,
                records
            });
        }

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
