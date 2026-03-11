import { createReview as createReviewService } from "../services/reviewService.js";
import catchAsync from "../utils/catchAsync.js";

const createReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;
  const videoId = req.video._id;
  const userId = req.user.id;

  const review = await createReviewService({
    videoId,
    userId,
    rating,
    comment,
  });

  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

export { createReview };
