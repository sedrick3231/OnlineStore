import { io } from "../app.js";
import Category from "../models/Category.model.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("getAllCategories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { id, name, image } = req.body;

    // Validate required fields
    if (!id || !name) {
      return res.status(400).json({
        success: false,
        message: "Category ID and name are required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ id }, { name }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name or ID already exists",
      });
    }

    // Create new category
    const category = await Category.create({
      id,
      name,
      image: image || "",
    });

    // Emit socket event for real-time updates
    io.emit("category:created", category);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("createCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    const category = await Category.findOne({ id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      category.name = name;
    }

    if (image !== undefined) {
      category.image = image;
    }

    await category.save();

    // Emit socket event for real-time updates
    io.emit("category:updated", category);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("updateCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndDelete({ id });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Emit socket event for real-time updates
    io.emit("category:deleted", id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      categoryId: id,
    });
  } catch (error) {
    console.error("deleteCategory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};
