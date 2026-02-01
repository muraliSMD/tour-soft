const mongoose = require('mongoose');

const academySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an academy name'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    logo: {
        type: String, // URL to image
        default: 'no-photo.jpg'
    },
    bannerImage: {
        type: String // URL to image
    },
    gallery: [{
        type: String // URLs to images
    }],
    contactEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    contactPhone: {
        type: String
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    socialLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String
    },
    sports: [{
        type: String,
        enum: ['Badminton'],
        default: 'Badminton'
    }],
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Slug generation moved to controller to avoid middleware errors
// academySchema.pre('save', ...);

// Cascade delete tournaments when a academy is deleted
academySchema.pre('remove', async function() {
    console.log(`Tournaments being removed from academy ${this._id}`);
    await this.model('Tournament').deleteMany({ academy: this._id });
});

// Reverse populate with tournaments
academySchema.virtual('tournaments', {
    ref: 'Tournament',
    localField: '_id',
    foreignField: 'academy',
    justOne: false
});

module.exports = mongoose.models.Academy || mongoose.model('Academy', academySchema);
