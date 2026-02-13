import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/solvia";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "sedrick3231@gmail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Administrator";

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: process.env.DB_NAME || undefined });
    console.log("Connected to DB");

    let admin = await User.findOne({ email: ADMIN_EMAIL }).exec();

    if (admin) {
      if (!admin.isAdmin) {
        admin.isAdmin = true;
        await admin.save();
        console.log("Existing user promoted to admin:", ADMIN_EMAIL);
      } else {
        console.log("Admin already exists:", ADMIN_EMAIL);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

      admin = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashed,
        isAdmin: true,
      });

      await admin.save();
      console.log("Admin user created:", ADMIN_EMAIL);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
}

main();
