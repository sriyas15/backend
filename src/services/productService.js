const mongoose = require("mongoose");
const productRepository = require("../repositories/productRepository");
const { NotFoundError, BadRequestError } = require("../errors");

class ProductService {
    _validateObjectId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestError(`Invalid product ID format: ${id}`);
        }
    }

    async getAllProducts(filter = {}) {
        return await productRepository.findAll(filter);
    }

    async getProductById(id) {
        this._validateObjectId(id);
        const product = await productRepository.findById(id);
        if (!product) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }
        return product;
    }

    async createProduct(productData) {
        return await productRepository.create(productData);
    }

    async updateProduct(id, updateData) {
        this._validateObjectId(id);
        const updatedProduct = await productRepository.updateById(id, updateData);
        if (!updatedProduct) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }
        return updatedProduct;
    }

    async deleteProduct(id) {
        this._validateObjectId(id);
        const deletedProduct = await productRepository.deleteById(id);
        if (!deletedProduct) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }
        return deletedProduct;
    }
}

module.exports = new ProductService();
