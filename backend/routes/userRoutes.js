import express from "express";
import {
  getMe,
  updateMe,
  getUserById,
  follow,
  unfollow,
  listFollowers,
  listFollowing,
  updatePreferences,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validateMiddleware.js";
import {
  updateMeSchema,
  updateNotificationPreferencesSchema,
} from "../utils/validators.js";

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/me", protect, getMe);

/**
 * @swagger
 * /users/updateMe:
 *   patch:
 *     summary: Update the currently authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMeRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 */
router.patch("/updateMe", protect, validate(updateMeSchema), updateMe);

/**
 * @swagger
 * /users/preferences:
 *   patch:
 *     summary: Update notification preferences for the authenticated user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationPreferencesRequest'
 *           example:
 *             inApp:
 *               followers: true
 *               comments: true
 *               likes: false
 *               tips: false
 *             email:
 *               followers: false
 *               comments: true
 *               likes: false
 *               tips: true
 *     responses:
 *       200:
 *         description: Notification preferences updated
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
 */
router.patch(
  "/preferences",
  protect,
  validate(updateNotificationPreferencesSchema),
  updatePreferences
);

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       201:
 *         description: Successfully followed the user
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
 *                     follow:
 *                       $ref: '#/components/schemas/Follow'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Already following this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/follow", protect, follow);

/**
 * @swagger
 * /users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       204:
 *         description: Successfully unfollowed — no content returned
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete("/:id/unfollow", protect, unfollow);

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     summary: List all followers of a user
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: object
 *                   properties:
 *                     followers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follow'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id/followers", listFollowers);

/**
 * @swagger
 * /users/{id}/following:
 *   get:
 *     summary: List all users that a user is following
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: List of following
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     following:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Follow'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id/following", listFollowing);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a public user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - $ref: '#/components/parameters/userId'
 *     responses:
 *       200:
 *         description: Public user profile
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", getUserById);

export default router;
