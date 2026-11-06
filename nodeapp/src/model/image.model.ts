import { Schema, model } from "mongoose";

// An uploaded image kept in MongoDB, used when IMAGE_STORAGE=mongo instead of Cloudinary.
// Avatars are at most 2 MB and covers 5 MB, well under MongoDB's 16 MB document limit.
export interface ImageRecord {
  data: Buffer;
  contentType: string;
  size: number;
  folder: string;
}

const imageSchema = new Schema<ImageRecord>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    folder: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Image = model<ImageRecord>("Image", imageSchema);
