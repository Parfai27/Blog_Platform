import { Request, Response } from "express";
import mongoose from "mongoose";
import { cloudinaryReady } from "../config/cloudinary";
import { User } from "../model/user.model";
import { deleteAvatar, uploadAvatar } from "../services/avatar.service";
import { errorResponse, successResponse } from "../utils/response.helper";
import { publicUser } from "../utils/user.helper";

// undefined means the field was not sent, so it stays unchanged.
const readOptional = (value: unknown) => (typeof value === "string" ? value.trim() : undefined);

export const updateMe = async (req: Request, res: Response) => {
  let uploadedId = "";

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json(errorResponse("Database is not connected. Set MONGO_URI and restart the API."));
    }

    const userId = req.user?.userId ?? "";
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json(errorResponse("This session has no account. Log in with a real user."));
    }

    const firstName = readOptional(req.body?.firstName);
    const lastName = readOptional(req.body?.lastName);
    const bio = readOptional(req.body?.bio);
    const file = req.file;

    if (firstName === undefined && lastName === undefined && bio === undefined && !file) {
      return res.status(400).json(errorResponse("Send firstName, lastName, bio, or avatar to update"));
    }
    if (firstName === "" || lastName === "") {
      return res.status(400).json(errorResponse("First name and last name cannot be empty"));
    }
    if ((firstName?.length ?? 0) > 40 || (lastName?.length ?? 0) > 40) {
      return res.status(400).json(errorResponse("First name and last name must be 40 characters or fewer"));
    }
    if ((bio?.length ?? 0) > 280) {
      return res.status(400).json(errorResponse("Bio must be 280 characters or fewer"));
    }
    if (file && !cloudinaryReady()) {
      return res.status(503).json(errorResponse("Image upload is not configured. Set the Cloudinary environment variables."));
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse("User not found"));
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;

    const oldAvatarId = user.avatar?.publicId;
    if (file) {
      const avatar = await uploadAvatar(file.buffer);
      uploadedId = avatar.publicId;
      user.avatar = avatar;
    }

    await user.save();

    if (file && oldAvatarId) {
      await deleteAvatar(oldAvatarId);
    }

    return res.status(200).json(successResponse({ user: publicUser(user) }, "Profile updated"));
  } catch (error) {
    if (uploadedId) {
      await deleteAvatar(uploadedId);
    }
    console.error("Update profile failed:", error instanceof Error ? error.message : error);
    return res.status(500).json(errorResponse("Could not update the profile"));
  }
};
