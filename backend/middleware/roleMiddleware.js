module.exports = (allowedRoles) => (req, res, next) => {
    const user = req.user; // Assuming `req.user` is added by verifyToken middleware

    // Check if the user's role is in the array of allowed roles
    if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: `Access denied for role: ${user.role}` });
    }
    next();
};