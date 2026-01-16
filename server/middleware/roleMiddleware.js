const { protect } = require('./authMiddleware');

// Middleware to require specific roles
const requireOwner = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Owner role required.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin or Owner role required.' });
    }
};

const requireReferee = (req, res, next) => {
    if (req.user && ['owner', 'admin', 'referee'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Referee, Admin, or Owner role required.' });
    }
};

const requirePlayer = (req, res, next) => {
    if (req.user) {
        // All authenticated users can access (player is the default role)
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, please login.' });
    }
};

module.exports = { requireOwner, requireAdmin, requireReferee, requirePlayer };
