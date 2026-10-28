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

module.exports = mongoose.model("Product", productSchema);