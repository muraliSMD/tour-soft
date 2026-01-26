const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    batch: {
        type: String,
        enum: ['morning', 'evening'],
        required: true
    },
    records: [{
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            required: true
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            default: 'absent'
        }
    }]
}, {
    timestamps: true
});

// Ensure only one attendance record per batch per day
attendanceSchema.index({ date: 1, batch: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
