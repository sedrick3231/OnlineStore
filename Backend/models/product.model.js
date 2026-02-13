import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userImage: {type: String},
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      feature: {
        type: String,
        required: true,
      },
      specifications: {
        type: String,
        required: true,
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicID: {
            type: String,
            required: true,
          },
        },
      ],
    },
    category: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    reviewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },

  { timestamps: true }
);

// Add indexes for frequently queried fields
productSchema.index({ category: 1 });
productSchema.index({ popular: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
