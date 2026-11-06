import { Request, Response } from "express";
import mongoose from "mongoose";
import { Image } from "../model/image.model";
import { databaseReady } from "../utils/db.helper";
import { errorResponse } from "../utils/response.helper";

// Sends an image stored with IMAGE_STORAGE=mongo. A stored image never changes
// (a new upload gets a new id), so browsers may keep it for a year.
export const getImage = async (req: Request, res: Response) => {
  try {
    if (!databaseReady(res)) return;

    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json(errorResponse("Image not found"));
    }

    const image = await Image.findById(id).select("data contentType size");
    if (!image) {
      return res.status(404).json(errorResponse("Image not found"));
    }

    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Content-Length", String(image.size));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).end(image.data);
  } catch (error) {
    console.error("Load image failed:", error instanceof Error ? error.message : error);
    return res.status(500).json(errorResponse("Could not load the image"));
  }
};
