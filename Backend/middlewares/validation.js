// Validation middleware for common field validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, one uppercase, one number
  return password.length >= 6;
};

export const validateProductInput = (req, res, next) => {
  const { name, price, category, stockQuantity } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Product name is required" });
  }
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ success: false, message: "Valid price is required" });
  }
  if (!category || category.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Category is required" });
  }
  if (!stockQuantity || isNaN(stockQuantity) || stockQuantity < 0) {
    return res.status(400).json({ success: false, message: "Valid stock quantity is required" });
  }

  next();
};

export const validateOrderInput = (req, res, next) => {
  const { userId, products, totalAmount } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: "At least one product is required" });
  }
  if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ success: false, message: "Valid total amount is required" });
  }

  next();
};
