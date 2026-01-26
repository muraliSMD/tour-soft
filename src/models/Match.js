const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tournament'
    },
    matchNumber: {
        type: Number,
        required: true
    },
    round: {
        type: Number,
        default: 1
    },
    team1: {
        name: { type: String, required: true },
        score: { type: Number, default: 0 }
    },
    team2: {
        name: { type: String, required: true },
        score: { type: Number, default: 0 }
    },
    referee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    targetScore: {
        type: Number,
        required: true,
        default: 20
    },
    winner: {
        type: String,
        enum: ['team1', 'team2', null],
        default: null
    },
    scoreHistory: [{
        team: { type: String, enum: ['team1', 'team2'] },
        score: { type: Number },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
