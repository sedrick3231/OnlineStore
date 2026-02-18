import mongoose from "mongoose";

const db = () => {
  const options = {
    maxPoolSize: 10,
    minPoolSize: 5,
    retryWrites: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  mongoose
    .connect(process.env.MONGODB_URI, options)
    .then(() => {
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      // Retry connection after 5 seconds
      setTimeout(db, 5000);
    });
};

export default db;

