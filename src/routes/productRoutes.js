const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");
const { validateBody } = require("../middleware/validateMiddleware");
const { createProductSchema, updateProductSchema } = require("../validators/productValidator");

const router = express.Router();

// ── Optional-auth middleware ─────────────────────────────────────────────────
// Attaches req.user if a valid Bearer token is present, but does NOT reject
// unauthenticated requests — they simply have req.user = undefined.
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authMiddleware(req, res, next);
    }
    next();
};

// ── Public / optional-auth ───────────────────────────────────────────────────

// GET /api/products
//   • Unauthenticated → all products (public catalogue)
//   • Authenticated user → own products only
//   • Admin → all products
router.get("/", optionalAuth, (req, res, next) => {
    productController.getAllProducts(req, res, next);
});

// GET /api/products/:id  — anyone can read a single product
router.get("/:id", (req, res, next) => {
    productController.getProductById(req, res, next);
});

// ── Authenticated (any role) ─────────────────────────────────────────────────

// POST /api/products  — any logged-in user can create
router.post(
    "/",
    authMiddleware,
    validateBody(createProductSchema),
    (req, res, next) => {
        productController.createProduct(req, res, next);
    }
);

// PUT /api/products/:id  — owner or admin only (checked inside service)
router.put(
    "/:id",
    authMiddleware,
    validateBody(updateProductSchema),
    (req, res, next) => {
        productController.updateProduct(req, res, next);
    }
);

// DELETE /api/products/:id  — owner or admin only (checked inside service)
router.delete("/:id", authMiddleware, (req, res, next) => {
    productController.deleteProduct(req, res, next);
});

module.exports = router;