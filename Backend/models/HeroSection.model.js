import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema({
  images: {
    type: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    default: [],
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"],
  },
  title: {
    type: String,
  },
  subTitle: {
    type: String,
  },
});

function arrayLimit(val) {
  return val.length <= 5;
}

const Hero = mongoose.model("hero", HeroSchema);
export default Hero;
