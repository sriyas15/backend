const { ValidationError } = require("../errors");

/**
 * Creates a middleware that validates request body against a Zod schema.
 * @param {import("zod").ZodSchema} schema
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const details = result.error.issues.map(issue => ({
                field: issue.path.join(".") || "body",
                message: issue.message
            }));

            return next(new ValidationError("Invalid request data", details));
        }

        req.body = result.data;
        next();
    };
};

module.exports = {
    validateBody
};
