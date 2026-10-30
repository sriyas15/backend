const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userRepository = require("../repositories/userRepository");
const { ConflictError, UnauthorizedError, NotFoundError } = require("../errors");

class AuthService {
    constructor() {
        this.accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "access_secret_key";
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || "refresh_secret_key";
        this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    }

    // ─── Token Generation ──────────────────────────────────────────────────────

    generateAccessToken(payload) {
        return jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiresIn
        });
    }

    generateRefreshToken(payload) {
        return jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn
        });
    }

    /**
     * Hash a raw refresh token before storing in DB.
     * We use SHA-256 (fast, deterministic) — bcrypt is unnecessary here
     * since refresh tokens are already high-entropy random values.
     */
    hashToken(rawToken) {
        return crypto.createHash("sha256").update(rawToken).digest("hex");
    }

    buildUserPayload(user) {
        return { id: user._id.toString(), email: user.email, role: user.role };
    }

    formatUser(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };
    }

    // ─── Register ──────────────────────────────────────────────────────────────

    async signup({ name, email, password }) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await userRepository.create({
            name,
            email,
            password: hashedPassword
        });

        const payload = this.buildUserPayload(newUser);
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        // Store hashed refresh token in DB
        await userRepository.updateRefreshToken(newUser._id, this.hashToken(refreshToken));

        return {
            user: this.formatUser(newUser),
            accessToken,
            refreshToken
        };
    }

    // ─── Login ─────────────────────────────────────────────────────────────────

    async login({ email, password }) {
        const user = await userRepository.findByEmail(email, true);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const payload = this.buildUserPayload(user);
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        // Rotate: store new hashed refresh token (invalidates old one)
        await userRepository.updateRefreshToken(user._id, this.hashToken(refreshToken));

        return {
            user: this.formatUser(user),
            accessToken,
            refreshToken
        };
    }

    // ─── Refresh ───────────────────────────────────────────────────────────────

    async refresh(rawRefreshToken) {
        if (!rawRefreshToken) {
            throw new UnauthorizedError("Refresh token is required");
        }

        // Verify signature & expiry
        let decoded;
        try {
            decoded = jwt.verify(rawRefreshToken, this.refreshSecret);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                throw new UnauthorizedError("Refresh token has expired. Please log in again");
            }
            throw new UnauthorizedError("Invalid refresh token");
        }

        // Fetch user + their stored hashed refresh token
        const user = await userRepository.findByIdWithRefreshToken(decoded.id);
        if (!user || !user.refreshToken) {
            throw new UnauthorizedError("Session not found. Please log in again");
        }

        // Constant-time comparison to defend against timing attacks
        const incomingHash = this.hashToken(rawRefreshToken);
        const isMatch = crypto.timingSafeEqual(
            Buffer.from(incomingHash),
            Buffer.from(user.refreshToken)
        );

        if (!isMatch) {
            // Possible token reuse — clear stored token (logout everywhere)
            await userRepository.clearRefreshToken(user._id);
            throw new UnauthorizedError("Refresh token reuse detected. Please log in again");
        }

        // Issue new token pair (rotation)
        const payload = this.buildUserPayload(user);
        const newAccessToken = this.generateAccessToken(payload);
        const newRefreshToken = this.generateRefreshToken(payload);

        await userRepository.updateRefreshToken(user._id, this.hashToken(newRefreshToken));

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    // ─── Logout ────────────────────────────────────────────────────────────────

    async logout(userId) {
        await userRepository.clearRefreshToken(userId);
    }

    // ─── Profile ───────────────────────────────────────────────────────────────

    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return this.formatUser(user);
    }
}

module.exports = new AuthService();
