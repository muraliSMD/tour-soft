const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role, creatorRole, sports } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please include all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation
    const requestedRole = role || 'player';
    
    // If requesting a role other than player, validate permissions
    if (requestedRole !== 'player') {
        if (!creatorRole) {
            return res.status(403).json({ message: 'Cannot create accounts with elevated roles without authorization' });
        }
        
        // Owner can create any role
        if (creatorRole === 'owner') {
            // Allowed
        } 
        // Admin can create referee and player
        else if (creatorRole === 'admin' && ['referee', 'player'].includes(requestedRole)) {
            // Allowed
        } 
        else {
            return res.status(403).json({ message: 'You do not have permission to create this role' });
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: requestedRole,
        sports: sports || [] // Add sports for admins
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            sports: user.sports,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate a user
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is disabled. Please contact your administrator.' });
        }
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            sports: user.sports,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = router;
