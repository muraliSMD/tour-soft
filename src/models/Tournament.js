const mongoose = require('mongoose');

const tournamentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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

module.exports = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema);
