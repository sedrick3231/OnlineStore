import express from "express";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "../controllers/category.controller.js";
import { DeleteHeroImage, GetheroData, updateHeroText, UploadHeroImage } from "../controllers/hero.controller.js";
import { getAllOrders, getOverviewStats, getRevenueStats, updateOrderStatus } from "../controllers/order.controller.js";
import { upload } from '../controllers/userImageupload.js';
const adminRoute = express.Router();

// Order routes
adminRoute.route("/api/v1/getOrders").post(getAllOrders);
adminRoute.route("/api/v1/updateOrderStatus/:id").put(updateOrderStatus);
adminRoute.route("/api/v1/stats/revenue").get(getRevenueStats);
adminRoute.route("/api/v1/stats/overview").get(getOverviewStats);

// Hero section routes
adminRoute.route('/api/v1/uploadHeroImage/:heroId').post(upload.single('image'), UploadHeroImage )
adminRoute.route('/api/v1/DeleteHeroImage').put( DeleteHeroImage )
adminRoute.route('/api/v1/uploadHerotext/:heroId').put( updateHeroText )

// Category routes
adminRoute.route("/api/v1/categories").get(getAllCategories).post(createCategory);
adminRoute.route("/api/v1/categories/:id").put(updateCategory).delete(deleteCategory);

export default adminRoute;