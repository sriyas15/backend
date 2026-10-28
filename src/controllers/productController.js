const productService = require("../services/productService");

class ProductController {
    async getAllProducts(req, res, next) {
        try {
            const products = await productService.getAllProducts();

            res.status(200).json({
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);

            res.status(200).json({
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async createProduct(req, res, next) {
        try {
            const product = await productService.createProduct(req.body);

            res.status(201).json({
                message: "Product created successfully",
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProduct = await productService.updateProduct(id, req.body);

            res.status(200).json({
                message: "Product updated successfully",
                data: updatedProduct
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            await productService.deleteProduct(id);

            res.status(200).json({
                message: "Product deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
