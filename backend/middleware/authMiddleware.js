const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT from the Authorization header and attaches
 * the decoded user id to req.userId for downstream handlers.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }
};

module.exports = { authenticate };
