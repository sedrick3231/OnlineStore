import { v2 as cloudinary } from "cloudinary";
import { io } from "../app.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const CreateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stockQuantity, popular } =
      req.body;

    // Parse description JSON
    let parsedDescription;
    try {
      parsedDescription = JSON.parse(description);
    } catch (e) {
      return res.status(400).json({ message: "Invalid description format" });
    }

    // Basic field checks
    if (
      !name ||
      !parsedDescription.feature ||
      !parsedDescription.specifications ||
      !price ||
      !category ||
      !stockQuantity
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // File check
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Uploading files to Cloudinary
    const images = [];
    for (const file of req.files) {
      try {
        images.push({
          url: file.path,
          publicID: file.filename, // assuming multer-storage-cloudinary stores `filename` as public_id
        });
      } catch (cloudErr) {
        return res.status(500).json({
          success: false,
          message: "Error uploading to Cloudinary",
          error: cloudErr.message || cloudErr,
        });
      }
    }

    const isPopular = popular === "true" || popular === true;

    // Create product document
    const product = new Product({
      name,
      description: {
        feature: parsedDescription.feature,
        specifications: parsedDescription.specifications,
      },
      price,
      category,
      stockQuantity,
      images,
      popular: isPopular,
    });

    await product.save();
    io.emit("product:added", product);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message || error,
    });
  }
};

export const UpdateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stockQuantity,
      existingImgIds, // array of publicIDs that should be kept
    } = req.body;
    const parsedDescription = JSON.parse(description);
    // Defensive parse of existingImages if sent as JSON string
    const parsedExistingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    // Validation
    if (!name || !parsedDescription || !price || !category || !stockQuantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      (!req.files || req.files.length === 0) &&
      parsedExistingImages.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const { id } = req.params;

    // Map uploaded files to images array
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicID: file.filename,
    }));

    // Find product
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images not in existingImgIds from Cloudinary
    if (Array.isArray(existingImgIds)) {
      for (const img of existingProduct.images) {
        if (img?.publicID && !existingImgIds.includes(img.publicID)) {
          await cloudinary.uploader.destroy(img.publicID);
        }
      }
    }

    // Combine new images with existing kept images
    const allImages = [...newImages, ...parsedExistingImages];

    // Update fields
    existingProduct.name = name;
    // Assuming description is an object with feature and specifications
    if (typeof parsedDescription === "object") {
      existingProduct.description.feature = parsedDescription.feature || "";
      existingProduct.description.specifications =
        parsedDescription.specifications || "";
    } else {
      existingProduct.description = description; // fallback if plain string
    }
    existingProduct.price = price;
    existingProduct.category = category;
    existingProduct.stockQuantity = stockQuantity;
    existingProduct.images = allImages;

    // Save updated product
    await existingProduct.save();

    // Notify via socket.io (assuming io is available in scope)
    io.emit("product:updated", existingProduct._id);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: existingProduct,
    });
  } catch (error) {
    console.error("UpdateProduct error:", error);
    return res.status(500).json({
      success: false,
      message: `Error updating the product: ${error.message}`,
    });
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      res.status(400).json({ success: false, message: "Product doesnt exist" });
    }

    for (const img of existingProduct.images) {
      if (img?.publicID) {
        await cloudinary.uploader.destroy(img.publicID);
      }
    }

    await Product.findOneAndDelete({ _id: existingProduct._id });
    io.emit("product:deleted", req.params.id);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting image", error });
  }
};

export const GetProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('-__v')
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: `Failed to fetch products: ${err.message}`,
    });
  }
};

export const togglePopular = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.popular = !product.popular;
    await product.save();
    io.emit("product:popular", product._id);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};

export const addReviewToProduct = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { rating, comment } = req.body;

    // Validate inputs
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "User ID and Product ID are required" });
    }

    if (!rating || !comment?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Rating and comment are required." });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(userId).select('name image');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Prevent duplicate reviews by the same user
    const alreadyReviewed = product.reviews.find(
      (rev) => rev.userId.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "You have already reviewed this product." });
    }

    const newReview = {
      userId,
      userImage: user.image.url,
      name: user.name,
      rating: Number(rating),
      comment: comment.trim(),
    };

    product.reviews.push(newReview);

    // Update reviewCount and averageRating
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.reviewCount = totalReviews;
    product.averageRating = sumRatings / totalReviews;

    await product.save();
    io.emit("product:updated", { productId: product._id });
    
    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review: newReview,
      reviewCount: product.reviewCount,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server error while adding review." });
  }
};

export const UpdateReview = async (req, res) => {
  try {
    const { userId, productId, reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment?.trim()) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Optional: make sure only the owner can update their review
    if (review.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this review." });
    }

    // Update fields
    review.rating = Number(rating);
    review.comment = comment.trim();

    // Recalculate reviewCount and averageRating
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.reviewCount = totalReviews;
    product.averageRating = sumRatings / totalReviews;

    await product.save();

    io.emit("product:updated", { productId });

    res.status(200).json({
      message: "Review updated successfully.",
      review,
      reviewCount: product.reviewCount,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error while updating review." });
  }
};

export const DeleteReview = async (req, res) => {
  try {
    const { userId, productId, reviewId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Check ownership
    if (product.reviews[reviewIndex].userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this review." });
    }

    product.reviews.splice(reviewIndex, 1); // delete the review

    // Update ratings
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.reviewCount = totalReviews;
    product.averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    await product.save();

    io.emit("product:updated", { productId });

    res.status(200).json({
      message: "Review deleted successfully.",
      reviewCount: product.reviewCount,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error while deleting review." });
  }
};

// Apply sale to all products
export const applySaleToAll = async (req, res) => {
  try {
    const { salePercentage } = req.body;

    // Validate input
    if (!salePercentage || salePercentage < 1 || salePercentage > 90) {
      return res.status(400).json({ 
        message: "Sale percentage must be between 1 and 90" 
      });
    }

    // Update all products
    const result = await Product.updateMany(
      {},
      {
        $set: {
          isOnSale: true,
          salePercentage: salePercentage
        }
      }
    );

    io.emit("product:updated", { action: "saleAppliedAll" });

    res.status(200).json({
      message: "Sale applied to all products successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error applying sale to all products:", error);
    res.status(500).json({ 
      message: "Server error while applying sale to all products" 
    });
  }
};

// Apply sale to specific product
export const applySaleToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { salePercentage } = req.body;

    // Validate input
    if (!salePercentage || salePercentage < 1 || salePercentage > 90) {
      return res.status(400).json({ 
        message: "Sale percentage must be between 1 and 90" 
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          isOnSale: true,
          salePercentage: salePercentage
        }
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    io.emit("product:updated", { productId: id });

    res.status(200).json({
      message: "Sale applied to product successfully",
      product
    });
  } catch (error) {
    console.error("Error applying sale to product:", error);
    res.status(500).json({ 
      message: "Server error while applying sale to product" 
    });
  }
};

// Remove sale from all products
export const removeSaleFromAll = async (req, res) => {
  try {
    const result = await Product.updateMany(
      {},
      {
        $set: {
          isOnSale: false,
          salePercentage: 0
        }
      }
    );

    io.emit("product:updated", { action: "saleRemovedAll" });

    res.status(200).json({
      message: "Sale removed from all products successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error removing sale from all products:", error);
    res.status(500).json({ 
      message: "Server error while removing sale from all products" 
    });
  }
};

// Remove sale from specific product
export const removeSaleFromProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          isOnSale: false,
          salePercentage: 0
        }
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    io.emit("product:updated", { productId: id });

    res.status(200).json({
      message: "Sale removed from product successfully",
      product
    });
  } catch (error) {
    console.error("Error removing sale from product:", error);
    res.status(500).json({ 
      message: "Server error while removing sale from product" 
    });
  }
};

