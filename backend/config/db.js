import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGO_URI =", process.env.MONGO_URI); // TESTING
    await mongoose.connect(process.env.MONGO_URI);
    console.log("CONNECTED DB NAME =", mongoose.connection.name); // TESTING
    console.log("CONNECTED HOST =", mongoose.connection.host); // TESTING
    console.log("CONNECTED PORT =", mongoose.connection.port); // TESTING
    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    process.exit(1); // Stop server if DB connection fails
  }
};

export default connectDB;