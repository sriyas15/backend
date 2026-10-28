const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validateMiddleware");
const { createProductSchema, updateProductSchema } = require("../validators/productValidator");

const router = express.Router();

// GET all products (Public)
router.get("/", (req, res, next) => {
    productController.getAllProducts(req, res, next);
});

// GET single product by ID (Public)
router.get("/:id", (req, res, next) => {
    productController.getProductById(req, res, next);
});

// CREATE a new product (Protected with JWT middleware)
router.post(
    "/",
    authMiddleware,
    validateBody(createProductSchema),
    (req, res, next) => {
        productController.createProduct(req, res, next);
    }
);

// UPDATE a product by ID (Protected with JWT middleware)
router.put(
    "/:id",
    authMiddleware,
    validateBody(updateProductSchema),
    (req, res, next) => {
        productController.updateProduct(req, res, next);
    }
);

// DELETE a product by ID (Protected with JWT middleware)
router.delete("/:id", authMiddleware, (req, res, next) => {
    productController.deleteProduct(req, res, next);
});

module.exports = router;