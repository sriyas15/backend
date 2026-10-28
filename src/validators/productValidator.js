const { z } = require("zod");

const createProductSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(1, "Name is required"),
    price: z
        .number({ required_error: "Price is required" })
        .positive("Price must be greater than zero"),
    description: z
        .string()
        .trim()
        .optional()
});

const updateProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .optional(),
    price: z
        .number()
        .positive("Price must be greater than zero")
        .optional(),
    description: z
        .string()
        .trim()
        .optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field (name, price, or description) must be provided to update"
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    // Backward-compatible alias for existing imports
    productSchema: createProductSchema
};