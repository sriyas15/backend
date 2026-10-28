const { AppError } = require("../errors");

const errorMiddleware = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let code = err.code || "INTERNAL_SERVER_ERROR";
    let message = err.message || "An unexpected error occurred";
    let details = err.details || null;

    // Handle Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = `Invalid format for field '${err.path}': ${err.value}`;
    }

    // Handle Mongoose Duplicate Key Error (E11000)
    if (err.code === 11000) {
        statusCode = 409;
        code = "DUPLICATE_KEY";
        const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
        message = `A record with this ${duplicateField} already exists`;
    }

    // Handle Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Database validation failed";
        details = Object.values(err.errors || {}).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Log unhandled server errors (500)
    if (statusCode >= 500) {
        console.error("Unhandled Error [500]:", err);
    }

    const responseBody = {
        error: {
            code,
            message
        }
    };

    if (details) {
        responseBody.error.details = details;
    }

    res.status(statusCode).json(responseBody);
};

module.exports = errorMiddleware;
