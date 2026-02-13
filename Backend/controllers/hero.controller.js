import { v2 as cloudinary } from "cloudinary";
import { io } from "../app.js";
import Hero from "../models/HeroSection.model.js";

export const UploadHeroImage = async (req, res) => {
  try {
    const { heroId } = req.params;
    let hero = await Hero.findById(heroId);

    if (!hero) {
      hero = await Hero.create({ images: [] });
    }

    if (req.file) {
      const newImage = {
        url: req.file.path,
        publicId: req.file.filename, // Cloudinary assigns this
      };

      // Limit to 5 images max
      if (hero.images.length >= 5) {
        return res
          .status(400)
          .json({ message: "Maximum 5 hero images allowed." });
      }

      hero.images.push(newImage);
      await hero.save();
      io.emit("hero:updated");
      return res.status(200).json({
        message: "Hero image uploaded successfully",
        images: hero.images,
        heroId: hero._id,
      });
    } else {
      return res.status(400).json({ message: "No file uploaded." });
    }
  } catch (error) {
    console.error("UploadHeroImage error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const GetheroData = async (req, res) => {
  try {
    const { heroId } = req.params;
    const hero = await Hero.findById(heroId);
    if (!hero) {
      return res.status(400).json({
        success: false,
        message: "Hero Section not Found.",
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Hero Section Found.",
      hero,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHeroText = async (req, res) => {
  try {
    const { heroId } = req.params;
    const hero = await Hero.findById(heroId);
    if (!hero) {
      return res.status(400).json({
        success: false,
        message: "Hero Section not Found.",
      });
    }
    const { title, subtitle } = req.body;
    hero.title = title;
    hero.subTitle = subtitle;

    await hero.save();
    io.emit("hero:updated");
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const DeleteHeroImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing publicId" });
    }

    // Remove image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from database
    const hero = await Hero.findOne();
    if (!hero) {
      return res
        .status(404)
        .json({ success: false, message: "Hero document not found" });
    }

    hero.images = hero.images.filter((img) => img.publicId !== publicId);
    await hero.save();
    io.emit("hero:updated");

    res
      .status(200)
      .json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting hero image:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
