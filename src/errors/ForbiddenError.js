const AppError = require("./AppError");

class ForbiddenError extends AppError {
    constructor(message = "Forbidden", details = null) {
        super(message, 403, "FORBIDDEN", details);
    }
}

module.exports = ForbiddenError;
