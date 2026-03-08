import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Comment must not exceed 500 characters"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review user is required"],
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Reviewed video is required"],
    },
  },
  { timestamps: true }
);

// Prevent one user reviewing the same video more than once
reviewSchema.index({ user: 1, video: 1 }, { unique: true });

// Helpful query indexes
reviewSchema.index({ video: 1 });
reviewSchema.index({ user: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;