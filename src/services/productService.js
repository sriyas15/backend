const mongoose = require("mongoose");
const productRepository = require("../repositories/productRepository");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../errors");

class ProductService {
    _validateObjectId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestError(`Invalid product ID format: ${id}`);
        }
    }

    /**
     * Verify the requesting user can mutate (update/delete) the product.
     * - Admins can always mutate any product.
     * - Regular users can only mutate their own products.
     */
    _assertOwnerOrAdmin(product, requestingUser) {
        if (requestingUser.role === "admin") return;

        // Compare ObjectIds as strings to avoid reference issues
        if (product.owner.toString() !== requestingUser.id) {
            throw new ForbiddenError("You do not have permission to modify this product");
        }
    }

    /**
     * GET all products.
     * - Admin sees every product.
     * - Regular users see only their own products.
     * - Unauthenticated (requestingUser = null) sees all (public listing).
     */
    async getAllProducts(requestingUser = null) {
        if (!requestingUser || requestingUser.role === "admin") {
            return await productRepository.findAll();
        }
        // Authenticated non-admin: scope to own products only
        return await productRepository.findAll({ owner: requestingUser.id });
    }

    async getProductById(id) {
        this._validateObjectId(id);
        const product = await productRepository.findById(id);
        if (!product) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }
        return product;
    }

    /**
     * Create a product owned by the requesting user.
     */
    async createProduct(productData, requestingUser) {
        return await productRepository.create({
            ...productData,
            owner: requestingUser.id
        });
    }

    /**
     * Update — only owner or admin.
     */
    async updateProduct(id, updateData, requestingUser) {
        this._validateObjectId(id);

        const product = await productRepository.findById(id);
        if (!product) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }

        this._assertOwnerOrAdmin(product, requestingUser);

        // Prevent owner field from being changed via update payload
        delete updateData.owner;

        const updated = await productRepository.updateById(id, updateData);
        return updated;
    }

    /**
     * Delete — only owner or admin.
     */
    async deleteProduct(id, requestingUser) {
        this._validateObjectId(id);

        const product = await productRepository.findById(id);
        if (!product) {
            throw new NotFoundError(`Product not found with id: ${id}`);
        }

        this._assertOwnerOrAdmin(product, requestingUser);

        return await productRepository.deleteById(id);
    }
}

module.exports = new ProductService();
