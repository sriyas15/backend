const { z } = require("zod");

const productSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    price: z.number().positive("Price must be greater than zero")
});

function validateProduct(req, res, next) {
    const result = productSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid product data",
                details: result.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            }
        });
    }

    req.body = result.data;
    next();
}

module.exports = validateProduct;