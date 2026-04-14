"use client";

import ReactPlayer from "react-player";
import { useRef, useState, useEffect } from "react";

export default function VideoPlayer({ src }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideControlsTimeoutRef = useRef(null);

  const togglePlay = () => {
    if (error) return;
    setIsPlaying((p) => !p);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

  const setPlayerCurrentTime = (nextTimeSeconds) => {
    const player = playerRef.current;
    if (!player) return;

    if (typeof player.seekTo === "function" && Number.isFinite(duration) && duration > 0) {
      player.seekTo(nextTimeSeconds / duration, "fraction");
      return;
    }

    if ("currentTime" in player) {
      player.currentTime = nextTimeSeconds;
    }
  };

  const handleSeek = (e) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isFinite(value)) return;
    const clamped = clamp01(value);
    setPlayed(clamped);
    if (Number.isFinite(duration) && duration > 0) {
      setPlayerCurrentTime(clamped * duration);
    }
  };

  const handleFullScreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const clearHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
      hideControlsTimeoutRef.current = null;
    }
  };

  const scheduleHideControls = () => {
    clearHideControlsTimer();
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 1800);
  };

  const revealControls = () => {
    setShowControls(true);
    scheduleHideControls();
  };

  const hideControlsNow = () => {
    clearHideControlsTimer();
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setPlayed(0);
    setIsLoading(true);
    setError(false);
    setShowControls(true);
  }, [src]);

  useEffect(() => {
    if (!isPlaying) {
      clearHideControlsTimer();
      setShowControls(true);
      return;
    }
    scheduleHideControls();
    return clearHideControlsTimer;
  }, [isPlaying]);

  useEffect(() => () => clearHideControlsTimer(), []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      setShowControls(true);
      scheduleHideControls();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const handlePointerMove = () => {
      revealControls();
    };

    const handlePointerLeave = () => {
      hideControlsNow();
    };

    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("touchstart", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      document.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("touchstart", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [isFullscreen, isPlaying]);

  const currentTime = played * duration;
  const safePlayed = Number.isFinite(played) ? clamp01(played) : 0;
  const safeVolume = Number.isFinite(volume) ? clamp01(volume) : 0.5;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded overflow-hidden"
      onMouseMove={revealControls}
      onMouseEnter={revealControls}
      onMouseLeave={hideControlsNow}
      onTouchStart={revealControls}
    >

      {/*Video */}
      <ReactPlayer
        ref={playerRef}
        src={src}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        controls={false}
        onProgress={({ played }) => {
          const nextPlayed = Number(played);
          if (Number.isFinite(nextPlayed)) {
            setPlayed(clamp01(nextPlayed));
          }
          if (isLoading) setIsLoading(false);
        }}
        onTimeUpdate={(e) => {
          const mediaDuration = Number(e?.target?.duration);
          const current = Number(e?.target?.currentTime);
          if (Number.isFinite(mediaDuration) && mediaDuration > 0 && Number.isFinite(current)) {
            setPlayed(Math.min(Math.max(current / mediaDuration, 0), 1));
          }
        }}
        onDurationChange={(e) => {
          const nextDuration = Number(e?.target?.duration);
          if (Number.isFinite(nextDuration) && nextDuration > 0) {
            setDuration(nextDuration);
          }
        }}
        onReady={() => setIsLoading(false)}
        onError={() => setError(true)}
      />

      {/*Loading */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500">
          Failed to load video
        </div>
      )}

      {!error && (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center text-white/85"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {!isPlaying ? (
            <span className="rounded-full bg-black/55 px-4 py-2 text-2xl leading-none">
              <i className="fi fi-br-play" />
            </span>
          ) : null}
        </button>
      )}

      {/* Duration Overlay */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        {formatTime(duration)}
      </div>

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-black/65 backdrop-blur text-white p-2 text-xs md:text-sm transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seek */}
        <input
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={safePlayed}
          onChange={handleSeek}
          className="w-full"
          aria-label="Seek video"
        />

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Play */}
            <button
              onClick={togglePlay}
              aria-label="Play or Pause video"
              className="shrink-0"
            >
              {isPlaying ? (
                <i className="fi fi-rr-pause" />
              ) : (
                <i className="fi fi-br-play" />
              )}
            </button>

            {/* Time */}
            <span className="text-xs whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/*  Volume */}
            <input
              type="range"
              min={0}
              max={1}
              step="0.1"
              value={safeVolume}
              onChange={(e) => {
                const vol = Number.parseFloat(e.target.value);
                const normalizedVolume = Number.isFinite(vol) ? clamp01(vol) : 0.5;
                setVolume(normalizedVolume);
                setMuted(normalizedVolume === 0);
              }}
              className="hidden lg:block w-20"
              aria-label="Volume control"
            />

            {/*  Mute */}
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label="Mute or unmute"
            >
              {muted ? (
                <i className="fi fi-bs-volume-slash" />
              ) : (
                <i className="fi fi-bs-volume" />
              )}
            </button>

            {/*  Speed */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="hidden lg:block bg-black text-white text-xs rounded px-1 py-0.5"
              aria-label="Playback speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            {/*  Fullscreen */}
            <button
              onClick={handleFullScreen}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <i className="fi fi-br-compress" />
              ) : (
                <i className="fi fi-bs-expand" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}