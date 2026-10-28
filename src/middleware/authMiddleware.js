const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");
const userRepository = require("../repositories/userRepository");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Authorization token is missing or malformed");
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new UnauthorizedError("Authorization token is missing");
        }

        const secret = process.env.JWT_SECRET || "fallback_secret_key_antigravity";

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                throw new UnauthorizedError("Token has expired. Please log in again");
            }
            throw new UnauthorizedError("Invalid authentication token");
        }

        // Attach decoded payload to request
        req.user = decoded;

        // Optionally verify user still exists in database
        const user = await userRepository.findById(decoded.id);
        if (!user) {
            throw new UnauthorizedError("The user belonging to this token no longer exists");
        }

        req.currentUser = user;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;
