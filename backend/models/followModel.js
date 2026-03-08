import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Follower is required"],
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Following user is required"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Hook: prevent self-follow
followSchema.pre("save", function (next) {
  if (this.follower.toString() === this.following.toString()) {
    return next(new Error("Users cannot follow themselves"));
  }
  next();
});

const Follow = mongoose.model("Follow", followSchema);

export default Follow;