const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Tournament'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'User'
    },
    teamName: {
        type: String,
        required: [true, 'Please add a team name']
    },
    city: {
        type: String,
        required: false
    },
    teamMembers: [{
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String }
    }],
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['manual', 'online'],
        required: false
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    paidBy: {
        type: String // Admin name who marked as paid manually
    },
    paidAt: {
        type: Date
    },
    transactionId: {
        type: String // For online payments
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
