const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                message: 'Umezuiwa kuingia. Tafadhali ingia kwenye akaunti yako.'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token expired or invalid
                return res.status(403).json({
                    message: 'Muda wa kuingia umeisha au si sahihi. Tafadhali ingia tena.'
                });
            }

            // Attach user info to request object
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Hitilafu ya mfumo, tafadhali jaribu tena baadaye' });
    }
};

/**
 * Generate JWT Token
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

/**
 * Optional Authentication Middleware
 * Verifies token if present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(); // No token, continue without user info
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded;
        }
        next();
    });
};

module.exports = {
    authenticateToken,
    generateToken,
    optionalAuth
};

