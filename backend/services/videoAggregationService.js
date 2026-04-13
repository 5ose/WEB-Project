export const RECENT_ENGAGEMENT_WINDOW_DAYS = 7;

export const getRecentEngagementSince = () =>
  new Date(Date.now() - RECENT_ENGAGEMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

// Reusable review aggregation pipeline from phase 1 so multiple feed/admin
// flows can rank or filter videos using the same rating + engagement summary.
export const buildVideoReviewSummaryPipeline = ({
  recentEngagementSince = getRecentEngagementSince(),
} = {}) => [
  {
    $group: {
      _id: "$video",
      avgRating: { $avg: "$rating" },
      reviewCount: { $sum: 1 },
      recentReviewCount: {
        $sum: {
          $cond: [{ $gte: ["$createdAt", recentEngagementSince] }, 1, 0],
        },
      },
    },
  },
];

export const buildReviewMetricsLookupStages = ({
  recentEngagementSince = getRecentEngagementSince(),
} = {}) => [
  {
    $lookup: {
      from: "reviews",
      let: { videoId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$video", "$$videoId"] },
          },
        },
        ...buildVideoReviewSummaryPipeline({ recentEngagementSince }),
      ],
      as: "reviewMetrics",
    },
  },
  {
    $addFields: {
      reviewMetrics: {
        $ifNull: [
          { $arrayElemAt: ["$reviewMetrics", 0] },
          { avgRating: 0, reviewCount: 0, recentReviewCount: 0 },
        ],
      },
    },
  },
  {
    $addFields: {
      avgRating: {
        $round: [{ $ifNull: ["$reviewMetrics.avgRating", 0] }, 2],
      },
      reviewCount: { $ifNull: ["$reviewMetrics.reviewCount", 0] },
      recentReviewCount: { $ifNull: ["$reviewMetrics.recentReviewCount", 0] },
    },
  },
];

export const buildTrendingScoringStages = () => [
  {
    $addFields: {
      recentEngagementScore: {
        $add: [
          { $multiply: ["$recentReviewCount", 10] },
          { $multiply: ["$reviewCount", 2] },
          { $divide: [{ $min: ["$viewscount", 5000] }, 100] },
        ],
      },
      trendingScore: {
        $add: [
          { $multiply: ["$avgRating", 20] },
          { $multiply: ["$recentReviewCount", 10] },
          { $multiply: ["$reviewCount", 2] },
          { $divide: [{ $min: ["$viewscount", 5000] }, 100] },
        ],
      },
    },
  },
  {
    $sort: {
      trendingScore: -1,
      recentReviewCount: -1,
      avgRating: -1,
      reviewCount: -1,
      viewscount: -1,
      createdAt: -1,
    },
  },
];

export const buildOwnerLookupStages = () => [
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
    },
  },
  { $unwind: "$owner" },
];
