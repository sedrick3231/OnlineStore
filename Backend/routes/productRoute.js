import express from "express";
import { upload } from "../controllers/ProductImageUpload.controller.js";
import {
  addReviewToProduct,
  CreateProduct,
  DeleteProduct,
  DeleteReview,
  GetProducts,
  togglePopular,
  UpdateProduct,
  UpdateReview,
  applySaleToAll,
  applySaleToProduct,
  removeSaleFromAll,
  removeSaleFromProduct,
} from "../controllers/product.controller.js";
import { deductStock } from "../controllers/order.controller.js";
import authenticateAdmin from "../middlewares/authentication.js";

const productRoute = express.Router();
productRoute
  .route("/addProduct/")
  .post(upload.array("images", 3), authenticateAdmin, CreateProduct);
productRoute
  .route("/editProduct/:id")
  .put(upload.array("images", 3), authenticateAdmin, UpdateProduct);
productRoute
  .route("/deleteProduct/:id")
  .delete(authenticateAdmin, DeleteProduct);
productRoute.route("/getProducts/").get(GetProducts);
productRoute
  .route("/togglePopular/:id")
  .patch(authenticateAdmin, togglePopular);
  
productRoute
  .route("/api/review/:userId/:productId")
  .post(addReviewToProduct);
productRoute
  .route("/api/Updatereview/:userId/:productId/:reviewId")
  .put(UpdateReview);
productRoute
  .route("/api/Deletereview/:userId/:productId/:reviewId")
  .delete(DeleteReview);

productRoute
  .route("/deduct-stock")
  .post(deductStock);

// Sale routes
productRoute
  .route("/apply-sale-all")
  .patch(authenticateAdmin, applySaleToAll);

productRoute
  .route("/apply-sale/:id")
  .patch(authenticateAdmin, applySaleToProduct);

productRoute
  .route("/remove-sale-all")
  .patch(authenticateAdmin, removeSaleFromAll);

productRoute
  .route("/remove-sale/:id")
  .patch(authenticateAdmin, removeSaleFromProduct);

export default productRoute;
