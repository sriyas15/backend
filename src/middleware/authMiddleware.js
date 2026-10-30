const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

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

        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret_key";

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                throw new UnauthorizedError("Access token has expired. Please refresh your token");
            }
            throw new UnauthorizedError("Invalid authentication token");
        }

        // Attach decoded payload — we don't re-query DB on every request
        // (DB check is already done during token issuance; use /me for live profile)
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;
