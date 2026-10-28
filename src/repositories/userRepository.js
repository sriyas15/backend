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

    async create(userData) {
        return await User.create(userData);
    }

    async existsByEmail(email) {
        return await User.exists({ email: email.toLowerCase().trim() });
    }
}

module.exports = new UserRepository();
