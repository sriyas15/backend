const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const { ConflictError, UnauthorizedError, NotFoundError } = require("../errors");

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || "fallback_secret_key_antigravity";
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
    }

    generateToken(payload) {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn
        });
    }

    async signup({ name, email, password }) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("User with this email already exists");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await userRepository.create({
            name,
            email,
            password: hashedPassword
        });

        const token = this.generateToken({
            id: newUser._id.toString(),
            email: newUser.email
        });

        return {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                createdAt: newUser.createdAt
            },
            token
        };
    }

    async login({ email, password }) {
        const user = await userRepository.findByEmail(email, true);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = this.generateToken({
            id: user._id.toString(),
            email: user.email
        });

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
            },
            token
        };
    }

    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }
}

module.exports = new AuthService();
