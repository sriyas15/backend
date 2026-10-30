const User = require("../models/User");

class UserRepository {
    async findByEmail(email, includePassword = false) {
        const query = User.findOne({ email: email.toLowerCase().trim() });
        if (includePassword) {
            query.select("+password");
        }
        return await query.exec();
    }

    async findById(id) {
        return await User.findById(id).exec();
    }

    async findByIdWithRefreshToken(id) {
        return await User.findById(id).select("+refreshToken").exec();
    }

    async create(userData) {
        return await User.create(userData);
    }

    async existsByEmail(email) {
        return await User.exists({ email: email.toLowerCase().trim() });
    }

    async updateRefreshToken(id, hashedToken) {
        return await User.findByIdAndUpdate(
            id,
            { refreshToken: hashedToken },
            { new: true }
        ).exec();
    }

    async clearRefreshToken(id) {
        return await User.findByIdAndUpdate(
            id,
            { refreshToken: null },
            { new: true }
        ).exec();
    }

    async findAll() {
        return await User.find().sort({ createdAt: -1 }).exec();
    }

    async deleteById(id) {
        return await User.findByIdAndDelete(id).exec();
    }
}

module.exports = new UserRepository();
