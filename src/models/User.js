const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'referee', 'player'],
        default: 'player'
    },
    sports: [{
        type: String
    }], // For admins - which sports they manage
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Enhanced profile fields
    academyName: { type: String },
    phone: { type: String },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
