const jwt = require('jsonwebtoken');
const Admin = require('../model/Admin'); // Ensure this path matches your project structure
const User = require('../model/userModel'); // For user-specific routes, if needed

const jwtSecret = process.env.JWT_SECRET; // Manually entered secret, consider using environment variables

// General authentication middleware
const authMiddleware = (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1]; // Extracting the Bearer Token
    
    // If the token is not in the headers, check the body
    if (!token) {
        token = req.body.token;
        // Remove the token from the body to avoid conflicts with other route handlers
        delete req.body.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        // Simplify by directly assigning the decoded details to req.user
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        req.owner = {
            id: decoded.id,
            role: decoded.role
        };

        if(decoded.role === 'admin'){
            next();
        } else {
            next();
        }

    } catch (error) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};


// Middleware to check if the authenticated user is an admin
const isAdmin = (req, res, next) => {
    // This checks if the role of the user is 'admin', this check is applicable if authMiddleware runs first
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { authMiddleware, isAdmin };
