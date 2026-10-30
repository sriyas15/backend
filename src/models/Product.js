const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0.01, "Price must be at least 0.01"]
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        // The user who created this product
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Product must have an owner"]
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Index for efficient owner-scoped queries
productSchema.index({ owner: 1 });

module.exports = mongoose.model("Product", productSchema);