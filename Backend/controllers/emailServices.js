// emailService.js
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/user.model.js";
import generateOTP from "../utils/GenerateOPT.js";
import { saveOTP, verifyOTP } from "../utils/OPT.js";
import { getLoginContext } from "../utils/VerifyDevice.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"LAMS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP) – Expires in 5 Minutes",
      text: `Hello,

Your One-Time Password (OTP) is: ${otp}

This code will expire in 5 minutes. Please do not share this code with anyone.

If you did not request this OTP, please ignore this email or contact our support team.

Thank you,
The Solvia Team`,
    });

  } catch (error) {
    throw error;
  }
};

export const sendOTP = async (email) => {
  if (!email) throw new Error("Email is required");
  try {
    const otp = generateOTP();
    saveOTP(email, otp);
    await sendOTPEmail(email, otp);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "All fields required" });

    const isValid = verifyOTP(email, otp);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }
    const { ip, userAgent } = getLoginContext(req);
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const user = await User.findOne({ email });
    user.loginDevices.push({
      ip,
      userAgent,
      lastSeen: now,
      expiresAt: thirtyDaysLater,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: true, // Always use secure in production
      sameSite: "None", // Allow cross-domain cookies
      path: "/",
    });
    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully", user, token });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const contactUs = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields except phone are required" });
    }

    await transporter.sendMail({
      from: `"LAMS" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Contact Us Form Submission: ${subject}`,
      html: `
    <h2>New Contact Us Message</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
    <hr>
    <p>Please respond to the user as soon as possible.</p>
  `,
    });


    res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error sending contact us email:", error);
    res.status(500).json({ success: false, message: "Failed to send your message. Please try again later." });
  }
};