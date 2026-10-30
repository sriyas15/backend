const { z } = require("zod");

const signupSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters long"),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Please provide a valid email address"),
    password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});

const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .email("Please provide a valid email address"),
    password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required")
});

const refreshSchema = z.object({
    refreshToken: z
        .string({ required_error: "Refresh token is required" })
        .min(1, "Refresh token is required")
});

module.exports = {
    signupSchema,
    loginSchema,
    refreshSchema
};
