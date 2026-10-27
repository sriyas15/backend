const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());

const openApiPath = path.join(
    __dirname,
    "../docs/openapi.yaml"
);

const openApiDocument = YAML.parse(
    fs.readFileSync(openApiPath, "utf8")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/products", productRoutes);

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred"
        }
    });
});

async function startServer() {
    try {
        await mongoose.connect("mongodb+srv://sriyas1508_db_user:hDgZRTSF68i2jXTR@backend-demo.6gtseax.mongodb.net/");

        app.listen(5000, () => {
            console.log("Server running on port 5000");
            console.log("Swagger UI: http://localhost:5000/api-docs");
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();