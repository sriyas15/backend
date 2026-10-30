const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const userRepository = require("../repositories/userRepository");
const { NotFoundError, ForbiddenError } = require("../errors");
const mongoose = require("mongoose");

const router = express.Router();

// All admin routes require a valid access token + admin role
router.use(authMiddleware, requireRole("admin"));

// GET /api/admin/users  — list all users
router.get("/users", async (req, res, next) => {
    try {
        const users = await userRepository.findAll();
        res.status(200).json({ data: users });
    } catch (error) {
        next(error);
    }
});

// GET /api/admin/users/:id  — get a specific user
router.get("/users/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new Error("Invalid user ID format"));
        }
        const user = await userRepository.findById(id);
        if (!user) {
            return next(new NotFoundError("User not found"));
        }
        res.status(200).json({ data: user });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/admin/users/:id  — delete a user (admin cannot delete themselves)
router.delete("/users/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new Error("Invalid user ID format"));
        }

        if (id === req.user.id) {
            return next(new ForbiddenError("Admins cannot delete their own account via this endpoint"));
        }

        const deleted = await userRepository.deleteById(id);
        if (!deleted) {
            return next(new NotFoundError("User not found"));
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
