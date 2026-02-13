import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    image: {
      url: {
        type: String,
        required: true,
        default:
          "https://static.vecteezy.com/system/resources/thumbnails/005/176/777/small/user-avatar-line-style-free-vector.jpg",
      },
      publicID: {
        type: String,
        required: true,
        default: "default_avatar",
      },
    },
    ShippingAddress: {
      type: new mongoose.Schema(
        {
          address: { type: String, default: "" },
          city: { type: String, default: "" },
          state: { type: String, default: "" },
          postalCode: { type: String,  default: "" },
          phone: { type: String, default: "" },
        },
        { _id: false } // optional: avoid nested _id
      ),
      default: {
        address: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
      },
    },
    Orders: {
      type: Number,
      default: 0,
    },
    loginDevices: {
      type: [
        {
          ip: { type: String, required: true },
          userAgent: { type: String, required: true },
          lastSeen: { type: Date, default: Date.now },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
export default User;
