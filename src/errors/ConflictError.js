const AppError = require("./AppError");

class ConflictError extends AppError {
    constructor(message = "Resource already exists", details = null) {
        super(message, 409, "CONFLICT", details);
    }
}

module.exports = ConflictError;
