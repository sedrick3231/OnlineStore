import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticateAdmin = async (req, res, next) => {
  try {
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7); // Remove "Bearer " prefix
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

export default authenticateAdmin;
