"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileVideo } from "lucide-react";
import { uploadVideo } from "../../../services/videoService";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const readVideoDuration = (selectedFile) =>
    new Promise((resolve) => {
      const probeVideo = document.createElement("video");
      const objectUrl = URL.createObjectURL(selectedFile);
      probeVideo.preload = "metadata";
      probeVideo.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        probeVideo.removeAttribute("src");
      };

      probeVideo.onloadedmetadata = () => {
        const durationSeconds = Number(probeVideo.duration);
        cleanup();
        resolve(Number.isFinite(durationSeconds) && durationSeconds > 0 ? Math.round(durationSeconds) : null);
      };

      probeVideo.onerror = () => {
        cleanup();
        resolve(null);
      };
    });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "video/mp4") {
      readVideoDuration(selected).then((duration) => {
        setVideoDuration(duration);
      });
      setFile(selected);
    } else {
      alert("Please select an MP4 video file");
      setVideoDuration(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    setError("");
    setSuccess("");
    setUploading(true);

    try {
      await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        file,
        duration: videoDuration,
      });

      setSuccess("Upload complete!");
      setFile(null);
      setVideoDuration(null);
      setTitle("");
      setDescription("");

      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>
      
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {success}
          </div>
        ) : null}

        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            placeholder="Enter video title"
          />
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            placeholder="Tell us about your video"
          />
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Video File</label>
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            file ? "border-purple-500 bg-purple-500/10" : "border-white/20 hover:border-purple-500"
          }`}>
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileVideo className="text-purple-500" size={32} />
                  <div className="text-left">
                    <p className="text-white text-sm">{file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {videoDuration ? (
                      <p className="text-gray-400 text-xs">
                        Duration: {Math.floor(videoDuration / 60)}:{String(videoDuration % 60).padStart(2, "0")}
                      </p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setVideoDuration(null);
                  }}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-400">Click or drag to upload MP4</p>
                <p className="text-gray-500 text-sm mt-1">Max 5 minutes, 500MB</p>
                <input type="file" accept="video/mp4" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>
    </div>
  );
}