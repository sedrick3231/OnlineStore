import express from 'express';
import { createOrder, getUserOrders, deductStock } from '../controllers/order.controller.js';
import { getUsers, Login, Logout, Register, resertingPassword, ResetPasswordLogin, UpdateAddress, updatePassword, UpdateUser } from '../controllers/user.controller.js';
import { upload } from '../controllers/userImageupload.js';
import authenticateAdmin from '../middlewares/authentication.js';
import { verifyUserOTP } from '../controllers/emailServices.js';
import { GetheroData } from '../controllers/hero.controller.js';

const userRoute = express.Router();

userRoute.route('/api/v1/register').post(Register);
userRoute.route('/api/v1/login').post(Login);
userRoute.route('/api/v1/logout').get(Logout);
userRoute.route('/api/v1/getusers').get(authenticateAdmin,getUsers);
userRoute.route('/api/v1/update').put(upload.single('image'),UpdateUser);
userRoute.route("/api/v1/createOrder").post(createOrder);
userRoute.route("/api/v1/get-order/:id").post(getUserOrders);
userRoute.route("/settings/updateAddress/:id").post(UpdateAddress);
userRoute.route("/api/verifyOtp").post(verifyUserOTP);
userRoute.route("/api/v1/updatePassword/:id").put(updatePassword);
userRoute.route("/api/v1/ResetPassword").post(ResetPasswordLogin);
userRoute.route("/api/v1/Password/:id").put(resertingPassword)
userRoute.route("/api/v1/getHeroData/:heroId").get(GetheroData);
userRoute.route("/api/v1/deduct-stock").post(deductStock);

export default userRoute;
