const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        let users;
        // Owner sees all
        // Owner sees all Admins, Owners, and their own created users (hides Admin's internal staff)
        if (req.user.role === 'owner') {
            if (req.query.createdBy) {
                // Allow Owner to drill down into an Admin's users
                users = await User.find({ createdBy: req.query.createdBy }).select('-password');
            } else {
                // Default view: Admins, Owners, and direct creations
                users = await User.find({
                    $or: [
                        { role: { $in: ['admin', 'owner'] } },
                        { createdBy: req.user.id }
                    ]
                }).select('-password');
            }
        } 
        // Admin sees Referees/Players created by them
        else if (req.user.role === 'admin') {
            users = await User.find({ 
                role: { $in: ['referee', 'player'] },
                createdBy: req.user.id
            }).select('-password');
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role, sports, academyName, phone, pincode, city, state, country } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please include all fields' });
        }

        // Check availability
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Role Validation
        const newRole = role || 'player';
        if (req.user.role === 'admin' && !['referee', 'player'].includes(newRole)) {
            return res.status(403).json({ message: 'Admins can only create Referees or Players' });
        }
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Not authorized to create users' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: newRole,
            role: newRole,
            sports: sports || [],
            academyName, 
            phone, 
            pincode, 
            city, 
            state, 
            country,
            createdBy: req.user.id,
            isActive: true
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                email: user.email,
                role: user.role,
                sports: user.sports,
                academyName: user.academyName,
                phone: user.phone,
                city: user.city
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Permission check
        if (req.user.role === 'admin') {
            // Admin can only edit own users
            if (user.createdBy && user.createdBy.toString() !== req.user.id) {
                 return res.status(403).json({ message: 'Not authorized to edit this user' });
            }
            if (!['referee', 'player'].includes(user.role)) {
                return res.status(403).json({ message: 'Admins can only edit Referees or Players' });
            }
        }

        // If changing role, check permissions
        if (req.body.role && req.body.role !== user.role) {
             if (req.user.role === 'admin' && !['referee', 'player'].includes(req.body.role)) {
                return res.status(403).json({ message: 'Admins can only set role to Referee or Player' });
            }
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.role = req.body.role || user.role;
        user.sports = req.body.sports || user.sports;

        user.academyName = req.body.academyName || user.academyName;
        user.phone = req.body.phone || user.phone;
        user.pincode = req.body.pincode || user.pincode;
        user.city = req.body.city || user.city;
        user.state = req.body.state || user.state;
        user.country = req.body.country || user.country;
        
        if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            role: updatedUser.role,
            sports: updatedUser.sports,
            academyName: updatedUser.academyName,
            phone: updatedUser.phone,
            city: updatedUser.city,
            isActive: updatedUser.isActive
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Permission check
        if (req.user.role === 'admin') {
            // Admin can only delete users they created
            if (user.createdBy && user.createdBy.toString() !== req.user.id) {
                 return res.status(403).json({ message: 'Not authorized to delete this user' });
            }
            // Admin can only delete Referees or Players
            if (!['referee', 'player'].includes(user.role)) {
                return res.status(403).json({ message: 'Admins can only delete Referees or Players' });
            }
        }

        await user.deleteOne();

        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
