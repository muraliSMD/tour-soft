const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // The admin/owner who manages this member
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    phone: {
        type: String
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    type: { // Distinction for attendance
        type: String,
        enum: ['training', 'player'], 
        default: 'player',
        required: true
    },
    batch: {
        type: String,
        enum: ['morning', 'evening'],
        required: true
    },
    category: {
        type: String,
        enum: ['children', 'adult'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    fees: [{
        month: { type: String, required: true }, // e.g., "2026-01"
        amount: { type: Number, required: true },
        status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
        paidDate: { type: Date }
    }],
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Member || mongoose.model('Member', memberSchema);
