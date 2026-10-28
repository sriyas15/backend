const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validateMiddleware");
const { signupSchema, loginSchema } = require("../validators/authValidator");

const router = express.Router();

// Public routes
router.post("/signup", validateBody(signupSchema), (req, res, next) => {
    authController.signup(req, res, next);
});

router.post("/login", validateBody(loginSchema), (req, res, next) => {
    authController.login(req, res, next);
});

// Protected route (demonstrates JWT authMiddleware)
router.get("/me", authMiddleware, (req, res, next) => {
    authController.getMe(req, res, next);
});

module.exports = router;
