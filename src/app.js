require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const { NotFoundError } = require("./errors");

const app = express();

// Body Parser
app.use(express.json());

// OpenAPI / Swagger Documentation
const openApiPath = path.join(__dirname, "../docs/openapi.yaml");
if (fs.existsSync(openApiPath)) {
    try {
        const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
    } catch (e) {
        console.warn("Could not load Swagger docs:", e.message);
    }
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

// 404 Handler for undefined routes
app.use((req, res, next) => {
    next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb+srv://sriyas1508_db_user:hDgZRTSF68i2jXTR@backend-demo.6gtseax.mongodb.net/";

async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

// Start server if run directly
if (require.main === module) {
    startServer();
}

module.exports = app;