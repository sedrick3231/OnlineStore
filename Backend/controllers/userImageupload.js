import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "users",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "tiff",
      "svg",
      "ico",
      "heic",
      "heif",
      "avif",
      "pdf",
      "eps",
      "psd",
      "raw",
      "indd",
      "ai",
      "djvu",
      "jfif",
      "jp2",
      "jxr",
      "hdp",
      "wdp",
      "cur",
      "tga",
    ],
  },
});

export const upload = multer({ storage: storage });
