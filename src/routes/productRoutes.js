const express = require("express");
const Product = require("../models/Product");
const validateProduct = require("../validators/productValidator");

const router = express.Router();

// GET all products
router.get("/", async (req, res, next) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            data: products
        });
    } catch (error) {
        next(error);
    }
});

// CREATE a product
router.post("/", validateProduct, async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            data: product
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;