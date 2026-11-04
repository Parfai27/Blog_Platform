import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { errorResponse } from "../utils/response.helper";

const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!AVATAR_TYPES.has(file.mimetype)) {
      callback(new Error("Avatar must be a JPEG, PNG, or WebP image"));
      return;
    }
    callback(null, true);
  },
});

export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
    const message = tooLarge
      ? "Avatar must be 2 MB or smaller"
      : error instanceof Error
        ? error.message
        : "Could not read the avatar";

    res.status(400).json(errorResponse(message));
  });
};
