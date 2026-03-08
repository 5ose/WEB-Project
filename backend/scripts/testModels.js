import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Video from "../models/videoModel.js";
import Review from "../models/reviewModel.js";
import Follow from "../models/followModel.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  const user1 = await User.create({
    username: "userone",
    email: "userone@test.com",
    password: "123456",
  });

  const user2 = await User.create({
    username: "usertwo",
    email: "usertwo@test.com",
    password: "123456",
  });

  const video = await Video.create({
    title: "My first video",
    description: "Test video",
    owner: user1._id,
    videoURL: "videos/test.mp4",
    duration: 120,
  });

  const review = await Review.create({
    rating: 5,
    comment: "Great video",
    user: user2._id,
    video: video._id,
  });

  const follow = await Follow.create({
    follower: user2._id,
    following: user1._id,
  });

  console.log({ user1, user2, video, review, follow });

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});