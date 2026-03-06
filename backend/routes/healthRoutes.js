import express from "express";
import { getHealth, getAdminHealth } from "../controllers/healthController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/api/v1/admin/health", protect, restrictTo("admin"), getAdminHealth);

export default router;