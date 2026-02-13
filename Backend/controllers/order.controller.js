import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { io } from "../app.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
      notes,
    } = req.body;

    // ✅ Validate required fields
    if (
      !userId ||
      !products ||
      !products.length ||
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.phone ||
      !paymentMethod ||
      !totalAmount
    ) {
      return res.status(400).json({ 
        message: "Missing required fields.",
        success: false
      });
    }

    // ✅ Validate stock availability for all products before making any changes
    const productCheckPromises = products.map(async (item) => {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        );
      }
      
      return product;
    });

    const validatedProducts = await Promise.all(productCheckPromises);

    // ✅ Deduct stock from all products and emit socket events
    const updatedProducts = [];
    const deductStockPromises = validatedProducts.map(async (product, index) => {
      const quantity = products[index].quantity;
      
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stockQuantity: -quantity } },
        { new: true }
      );

      
      // ✅ Emit real-time socket event for stock update
      io.emit("stock:updated", {
        productId: updatedProduct._id,
        productName: updatedProduct.name,
        newStock: updatedProduct.stockQuantity,
        deductedQuantity: quantity,
        timestamp: new Date().toISOString(),
      });

      updatedProducts.push(updatedProduct);
      return updatedProduct;
    });

    await Promise.all(deductStockPromises);

    // ✅ Create the order
    const newOrder = new Order({
      userId,
      products,
      address: shippingAddress,
      paymentMethod,
      totalAmount,
      notes,
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid",
      status: "Pending",
    });

    await newOrder.save();

    // ✅ Find user and update order count
    const existingUser = await User.findById(userId);
    if (existingUser) {
      existingUser.Orders = (existingUser.Orders || 0) + 1;
      await existingUser.save();
    } else {
      console.warn(`⚠️ User with id ${userId} not found while creating order`);
    }

    // ✅ Emit order created event
    io.emit("order:created", {
      orderId: newOrder._id,
      userId,
      totalAmount,
      productCount: products.length,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "Order placed successfully! Stock has been deducted.",
      order: newOrder,
      updatedProducts: updatedProducts.map(p => ({
        _id: p._id,
        name: p.name,
        newStock: p.stockQuantity,
      })),
      success: true,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    
    // ✅ Emit error event
    io.emit("order:error", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({ 
      message: error.message || "Failed to create order. Please try again.",
      success: false 
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const AllOrders = await Order.find()
      .populate('userId', 'name email')
      .lean()
      .exec();
    return res.status(200).json({
      success: true,
      Orders: AllOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Orders.",
      error: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const orders = await Order.find({ userId })
      .lean()
      .exec();
    return res.status(200).json({
      success: true,
      Orders: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Orders.",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Determine the payment status based on order status
    let paymentStatus = "Pending";
    if (status === "Cancelled") {
      paymentStatus = "Rejected";
    } else if (status === "Delivered") {
      paymentStatus = "Paid";
    }

    // Build the update object
    const updateFields = { status };
    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    // Update order in DB
    const order = await Order.findByIdAndUpdate(orderId, updateFields, {
      new: true,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const revenueByMonth = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },
      {
        $group: {
          _id: { $month: "$date" },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = months.map((month, index) => {
      const found = revenueByMonth.find((item) => item._id === index + 1);
      return { month, revenue: found ? found.revenue : 0 };
    });

    res.json(result);
  } catch (error) {
    console.error("Error generating revenue stats:", error);
    res.status(500).json({ message: "Failed to get revenue stats" });
  }
};

export const getOverviewStats = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      stats: {
        totalSales: totalSales[0]?.total || 0,
        orders: totalOrders,
        products: totalProducts,
        customers: totalUsers,
      },
    });
  } catch (error) {
    console.error("Overview Stats Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// ✅ Deduct Stock from Products (with socket events)
export const deductStock = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid products array",
      });
    }

    // ✅ Validate and deduct stock
    const deductedProducts = [];
    
    for (const item of products) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Each product must have productId and quantity",
        });
      }

      // ✅ Check if product exists and has sufficient stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found`,
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}`,
        });
      }

      // ✅ Deduct stock
      product.stockQuantity -= quantity;
      await product.save();
            
      // ✅ Emit real-time socket event
      io.emit("stock:updated", {
        productId: product._id,
        productName: product.name,
        newStock: product.stockQuantity,
        deductedQuantity: quantity,
        timestamp: new Date().toISOString(),
      });
      
      deductedProducts.push({
        productId,
        name: product.name,
        previousStock: product.stockQuantity + quantity,
        quantityDeducted: quantity,
        newStock: product.stockQuantity,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock deducted successfully",
      data: deductedProducts,
    });
  } catch (error) {
    console.error("❌ Error deducting stock:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to deduct stock",
      error: error.message,
    });
  }
};