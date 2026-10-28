const Product = require("../models/Product");

class ProductRepository {
    async findAll(filter = {}) {
        return await Product.find(filter).sort({ createdAt: -1 }).exec();
    }

    async findById(id) {
        return await Product.findById(id).exec();
    }

    async create(productData) {
        return await Product.create(productData);
    }

    async updateById(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).exec();
    }

    async deleteById(id) {
        return await Product.findByIdAndDelete(id).exec();
    }
}

module.exports = new ProductRepository();
