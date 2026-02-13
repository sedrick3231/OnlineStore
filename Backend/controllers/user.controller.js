import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { getLoginContext } from "../utils/VerifyDevice.js";
import { sendOTP } from "./emailServices.js";

export const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // await sendOTP(newUser.email); // await in case it's async
    // newUser.loginDevices = newUser.loginDevices || [];

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // const { ip, userAgent } = getLoginContext(req);

    // const existingDevice = user.loginDevices?.find(
    //   (device) => device.ip === ip && device.userAgent === userAgent
    // );

    // if (!existingDevice) {
    //   // await sendOTP(user.email); // await in case it's async
    //   // user.loginDevices = user.loginDevices || [];

    //   return res.status(200).json({
    //     success: true,
    //     message: "Login from new device. OTP sent.",
    //   });
    // }

    // Generate JWT token for known device
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      domain: process.env.NODE_ENV === "production" ? ".up.railway.app" : "",
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const ResetPasswordLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await sendOTP(user.email); // await in case it's async

    return res.status(200).json({
      success: true,
      message: "OTP sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

export const Logout = async (_, res) => {
  res.clearCookie("token");
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    domain: ".up.railway.app",
    path: "/",
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const getUsers = async (_, res) => {
  try {
    const users = await User.find().select('-password').lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: `Failed to fetch users: ${err.message}`,
    });
  }
};

export const UpdateUser = async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required!",
      });
    }
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    existingUser.name = name;
    if (existingUser.image.publicID !== `default_avatar`) {
      const result = await cloudinary.uploader.destroy(
        existingUser.image.publicID
      );
    }
    // If image is uploaded
    if (req.file) {
      existingUser.image = {
        url: req.file.path,
        publicID: req.file.filename, // Cloudinary assigns this
      };
    }
    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully!",
      user: existingUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User update failed.",
    });
  }
};

export const UpdateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.ShippingAddress = shippingAddress;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Shipping address updated successfully",
      shippingAddress: user.ShippingAddress,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user not found.",
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid previous Password",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Upadted Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Upadting the password.",
    });
  }
};

export const resertingPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user not found.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Upadted Successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error Upadting the password.",
    });
  }
};
