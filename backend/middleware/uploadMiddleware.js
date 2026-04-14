import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import s3, { BUCKET_NAME } from "../config/minio.js";
import AppError from "../utils/appError.js";

// 1. Multer
// diskStorage saves the file temporarily on disk so ffmpeg can probe it
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.resolve(process.cwd(), ".tmp-uploads");
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      cb(null, tmpDir);
    } catch (err) {
      cb(new AppError("Temporary upload directory is not available", 500));
    }
  },
  filename: (req, file, cb) => cb(null, `${randomUUID()}.mp4`),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(new AppError("Only MP4 videos are allowed", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
});

// TODO in phase 4
// videos shall be posted to BULL queue

// 2. ffmpeg duration check
const checkDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(new AppError("Could not read video metadata", 400));
      const duration = metadata.format.duration; // in seconds
      resolve(duration);
    });
  });
};

const getFallbackDurationFromRequest = (req) => {
  const parsed = Number.parseInt(req.body?.duration, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

// 3. S3 upload to MinIO 
const uploadToMinio = async (filePath, mimeType) => {
  const objectKey = `${randomUUID()}.mp4`;  // the unique key stored in MongoDB

  const fileStream = fs.createReadStream(filePath);

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key:    objectKey,
    Body:   fileStream,
    ContentType: mimeType,
  }));

  return objectKey; // only returned AFTER confirmed upload
};

// 4. The combined middleware
export const handleVideoUpload = [
  // Step A: multer runs first - puts file in /tmp
  upload.single("video"),

  // Step B: duration check + S3 upload
  async (req, res, next) => {
    if (!req.file) return next(new AppError("No video file uploaded", 400));

    const tempPath = req.file.path;

    try {
      // Prefer ffprobe, but fallback to client-provided duration if ffprobe is unavailable.
      let duration = null;
      try {
        duration = await checkDuration(tempPath);
      } catch (probeError) {
        duration = getFallbackDurationFromRequest(req);
        if (!duration) {
          throw new AppError(
            "Could not read video metadata. Install FFmpeg/ffprobe or retry upload.",
            400
          );
        }
      }
      if (duration > 300) {
        fs.unlinkSync(tempPath); // delete temp file immediately
        return next(new AppError("Video exceeds the 5-minute limit", 400));
      }

      // Upload to MinIO
      const objectKey = await uploadToMinio(tempPath, req.file.mimetype);

      // Attach to req so the controller can use them
      req.objectKey = objectKey;
      req.videoDuration = Math.round(duration);

      next();
    } catch (err) {
      // Always clean up temp file on any error
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      next(err);
    }
  },
];