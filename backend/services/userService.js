import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

export const getCurrentUser = async (userId) => {
  return await User.findById(userId);
};

export const updateCurrentUser = async (userId, updates) => {
  const allowedFields = ["username", "bio", "avatarKey"];
  const forbiddenFields = ["password", "email", "role"];

  for (const field of forbiddenFields) {
    if (updates[field] !== undefined) {
      throw new AppError(`You cannot update ${field} here`, 400);
    }
  }

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (filteredUpdates.username) {
    const existingUsername = await User.findOne({
      username: filteredUpdates.username,
      _id: { $ne: userId },
    });

    if (existingUsername) {
      throw new AppError("Username already in use", 400);
    }
  }

  return await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });
};

export const getPublicUserById = async (userId) => {
  return await User.findById(userId).select("username bio avatarKey role createdAt");
};