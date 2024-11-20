const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key'; // Use the same secret as in authRoutes.js

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user; // Attach the decoded user info to the request
        next(); // Move to the next middleware or route handler
    });
}

module.exports = { authenticateToken };
