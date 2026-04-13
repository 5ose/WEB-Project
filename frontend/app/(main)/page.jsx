"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { CalendarDays, Clock, Eye, Play, RefreshCw, UserRound } from "lucide-react";
import { useApp } from "../../context/AppContext";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getVideos } from "../../services/videoService";

const PAGE_SIZE = 8;

const formatDuration = (totalSeconds = 0) => {
  const safeSeconds = Math.max(Number(totalSeconds) || 0, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatViews = (views = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(Number(views) || 0, 0));

export default function HomePage() {
  const { user } = useAuthContext();
  const { showError } = useApp();
  const [videos, setVideos] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const nextSkipRef = useRef(0);
  const initialLoadStartedRef = useRef(false);

  const loadVideos = useCallback(async ({ reset = false } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    if (!reset && !hasMore) {
      return;
    }

    isFetchingRef.current = true;

    if (reset) {
      setInitialLoading(true);
      nextSkipRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    setFeedError("");

    try {
      const { videos: nextVideos, pagination } = await getVideos({
        limit: PAGE_SIZE,
        skip: reset ? 0 : nextSkipRef.current,
      });

      setVideos((currentVideos) => {
        if (reset) {
          return nextVideos;
        }

        const existingIds = new Set(currentVideos.map((video) => video._id));
        const uniqueVideos = nextVideos.filter((video) => !existingIds.has(video._id));
        return [...currentVideos, ...uniqueVideos];
      });

      setHasMore(pagination.hasMore);
      setTotalVideos(pagination.total);
      nextSkipRef.current =
        pagination.nextSkip ?? pagination.skip + nextVideos.length;
    } catch (error) {
      const message = error.message || "Unable to load the video feed";
      setFeedError(message);
      showError(message);
    } finally {
      if (reset) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }

      isFetchingRef.current = false;
    }
  }, [hasMore, showError]);

  useEffect(() => {
    if (initialLoadStartedRef.current) {
      return;
    }

    initialLoadStartedRef.current = true;
    loadVideos({ reset: true });
  }, [loadVideos]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || initialLoading || loadingMore || !hasMore || Boolean(feedError)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadVideos();
        }
      },
      {
        rootMargin: "240px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [feedError, hasMore, initialLoading, loadVideos, loadingMore]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-white/10">
        <h1 className="text-3xl font-bold text-white">
          {user ? `Welcome back, ${user.username}!` : "Explore the latest videos"}
        </h1>
        <p className="text-gray-400 mt-2">
          Scroll through the feed and more videos will load automatically as you reach the bottom.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          {initialLoading ? "Loading feed..." : `${videos.length} of ${totalVideos} videos loaded`}
        </p>
      </div>

      {feedError && !videos.length ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-lg font-semibold text-white">The feed could not be loaded.</p>
          <p className="mt-2 text-sm text-red-100/80">{feedError}</p>
          <button
            type="button"
            onClick={() => loadVideos({ reset: true })}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      ) : null}

      {initialLoading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5">
          <LoadingSpinner size="lg" color="purple" />
          <p className="text-sm text-gray-400">Loading videos for your feed...</p>
        </div>
      ) : null}

      {!initialLoading && !videos.length && !feedError ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-lg font-semibold text-white">No public videos yet.</p>
          <p className="mt-2 text-sm text-gray-400">
            New uploads will appear here automatically once creators publish them.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <div
            key={video._id}
            className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
              <Play className="text-white/50 group-hover:text-white/80 transition-colors" size={48} />
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(video.duration)}
              </div>
              <div className="absolute top-2 left-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                Public
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-1">{video.title}</h3>
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <UserRound size={14} />
                @{video.owner?.username || "unknown"}
              </p>

              <p className="text-sm text-gray-300 min-h-12 mb-4">
                {video.description || "No description provided for this upload yet."}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-400">
                <div className="rounded-xl bg-black/30 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Eye size={16} />
                    {formatViews(video.viewscount)} views
                  </span>
                </div>
                <div className="rounded-xl bg-black/30 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!initialLoading && videos.length ? (
        <div className="flex flex-col items-center gap-4 py-2">
          <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

          {loadingMore ? (
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <LoadingSpinner size="sm" color="purple" />
              Loading more videos...
            </div>
          ) : null}

          {feedError ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-red-200">{feedError}</p>
              <button
                type="button"
                onClick={() => loadVideos()}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <RefreshCw size={16} />
                Try loading again
              </button>
            </div>
          ) : null}

          {!hasMore && !feedError ? (
            <p className="text-sm text-gray-500">You&apos;ve reached the end of the feed.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
