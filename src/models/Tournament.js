const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    academy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Optional for now to support legacy tournaments
        ref: 'Academy'
    },
    title: {
        type: String,
        required: [true, 'Please add a tournament title']
    },
    game: {
        type: String,
        required: [true, 'Please select a game']
    },
    format: {
        type: String,
        required: [true, 'Please select a format']
    },
    event: {
        type: String,
        required: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Completed'],
        default: 'Draft'
    },
    maxParticipants: {
        type: Number,
        default: 16
    }
}, {
    timestamps: true
});

// Force re-compilation of the model to ensure new fields (startDate, endDate) are picked up
// This fixes the issue where Next.js caches the old schema
if (mongoose.models.Tournament) {
    delete mongoose.models.Tournament;
}

module.exports = mongoose.model('Tournament', tournamentSchema);
