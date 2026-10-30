const { ForbiddenError, UnauthorizedError } = require("../errors");

/**
 * Middleware factory: restricts a route to users whose role is in the allowed list.
 * Must be used AFTER authMiddleware (which populates req.user).
 *
 * Usage:
 *   router.delete("/:id", authMiddleware, requireRole("admin"), handler);
 *   router.get("/admin/users", authMiddleware, requireRole("admin"), handler);
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new ForbiddenError(
                    `Access denied. Required role: ${allowedRoles.join(" or ")}`
                )
            );
        }

        next();
    };
};

module.exports = requireRole;
