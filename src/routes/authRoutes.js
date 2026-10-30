const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validateMiddleware");
const { signupSchema, loginSchema, refreshSchema } = require("../validators/authValidator");

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────

// POST /api/auth/signup  — register a new user
router.post("/signup", validateBody(signupSchema), (req, res, next) => {
    authController.signup(req, res, next);
});

// POST /api/auth/login  — authenticate and receive token pair
router.post("/login", validateBody(loginSchema), (req, res, next) => {
    authController.login(req, res, next);
});

// POST /api/auth/refresh  — exchange a valid refresh token for new token pair
router.post("/refresh", validateBody(refreshSchema), (req, res, next) => {
    authController.refresh(req, res, next);
});

// ── Protected routes (valid access token required) ───────────────────────────

// POST /api/auth/logout  — invalidate the refresh token server-side
router.post("/logout", authMiddleware, (req, res, next) => {
    authController.logout(req, res, next);
});

// GET /api/auth/me  — get the authenticated user's profile
router.get("/me", authMiddleware, (req, res, next) => {
    authController.getMe(req, res, next);
});

module.exports = router;
