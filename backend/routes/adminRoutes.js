import express from "express";
import { getStats, patchUserStatus, getModeration } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require a valid JWT + admin role
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get platform-wide statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Returns aggregate statistics for the platform.
 *       **Requires admin role.**
 *     responses:
 *       200:
 *         description: Platform stats retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/AdminStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/stats",              getStats);

/**
 * @swagger
 * /admin/moderation:
 *   get:
 *     summary: Get content flagged for moderation
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Returns videos that are flagged or have a low average rating.
 *       **Requires admin role.**
 *     parameters:
 *       - name: ratingThreshold
 *         in: query
 *         required: false
 *         description: Filter videos with an average rating below this value (e.g. 2.0)
 *         schema:
 *           type: number
 *           format: float
 *           example: 2.0
 *     responses:
 *       200:
 *         description: Moderation content retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   description: Flagged videos and low-rated content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/moderation",         getModeration);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   patch:
 *     summary: Update a user's account status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     description: >
 *       Sets a user's `accountStatus` to `active`, `suspended`, or `banned`.
 *       **Requires admin role.**
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatchUserStatusRequest'
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/users/:id/status", patchUserStatus);

export default router;