import express from "express";
import { listVideos, createVideo, updateVideo, deleteVideo, loadVideo } from "../controllers/videoController.js";
import { createVideoSchema, updateVideoSchema } from "../utils/validators.js";
import validate from "../middleware/validateMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkOwnership } from "../middleware/ownershipMiddleware.js";

const router = express.Router();

router.get("/", listVideos);
router.post("/", protect, validate(createVideoSchema), createVideo);
router.patch(
  "/:id",
  protect,
  loadVideo,
  checkOwnership((req) => req.video.owner),
  validate(updateVideoSchema),
  updateVideo
);
router.delete(
  "/:id",
  protect,
  loadVideo,
  checkOwnership((req) => req.video.owner),
  deleteVideo
);

export default router;