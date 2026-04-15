"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Eye, RefreshCw, Star, UserRound } from "lucide-react";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import VideoPlayer from "../../../../components/ui/VideoPlayer";
import VideoReviewSection from "../../../../components/ui/VideoReviewSection";
import { getVideoDetails } from "../../../../services/videoService";

const renderStars = (rating) =>
  [1, 2, 3, 4, 5].map((value) => (
    <Star
      key={value}
      size={14}
      className={value <= Number(rating || 0) ? "fill-amber-400 text-amber-400" : "fill-transparent text-white/25"}
      strokeWidth={value <= Number(rating || 0) ? 0 : 1.5}
    />
  ));

const formatViews = (views = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(Number(views) || 0, 0));

export default function VideoDetailsPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadVideoDetails = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setLoadError("");
    try {
      const payload = await getVideoDetails(id);
      setVideo(payload.video);
      setReviews(payload.reviews);
    } catch (error) {
      setLoadError(error.message || "Unable to load this video");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVideoDetails();
  }, [loadVideoDetails]);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <LoadingSpinner size="lg" color="purple" />
      </div>
    );
  }

  if (loadError || !video) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <p className="text-lg font-semibold text-white">Video not available</p>
        <p className="text-sm text-red-100/80">{loadError || "The requested video could not be found."}</p>
        <Link href="/" className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {video.playbackUrl ? (
          <VideoPlayer src={video.playbackUrl} />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-black/40 text-sm text-gray-400">
            Video source unavailable
          </div>
        )}
        <VideoReviewSection videoId={video._id} />
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold text-white">{video.title || "Untitled video"}</h1>
        <p className="text-sm text-gray-300">
          {video.description || "No description provided for this upload yet."}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <UserRound size={12} />@{video.owner?.username || "unknown"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={12} />
            {formatViews(video.viewscount)} views
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} />
            {new Date(video.createdAt).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/25 bg-yellow-500/10 px-2 py-1 text-yellow-100">
            <Star size={12} />
            {Number(video.avgRating ?? 0).toFixed(1)} avg ({video.reviewCount ?? 0} reviews)
          </span>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Comments and reviews</h2>
          <button
            type="button"
            onClick={loadVideoDetails}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-gray-200 transition hover:bg-white/10"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {!reviews.length ? (
          <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-400">
            No reviews yet. Be the first to rate this video.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <article key={review._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">@{review.user?.username || "user"}</p>
                  <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                </div>
                <p className="mt-2 text-sm text-gray-300">
                  {review.comment?.trim() ? review.comment : "No written comment."}
                </p>
                <p className="mt-2 text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
