import mongoose from "mongoose";
import cloudinary, { cloudinaryReady } from "../config/cloudinary";
import { Image } from "../model/image.model";

type StoredImage = { url: string; publicId: string };

// IMAGE_STORAGE=mongo keeps uploads in the database (served from /api/images/:id).
// Anything else uses Cloudinary.
export const imageStorage = () => (process.env.IMAGE_STORAGE === "mongo" ? "mongo" : "cloudinary");

export const imageStorageReady = () =>
  imageStorage() === "mongo" ? mongoose.connection.readyState === 1 : cloudinaryReady();

export const IMAGE_STORAGE_NOT_READY =
  "Image upload is not configured. Set the Cloudinary environment variables, or set IMAGE_STORAGE=mongo.";

const uploadToCloudinary = (buffer: Buffer, folder: string) => {
  return new Promise<StoredImage>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Image upload failed"));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
};

const uploadToMongo = async (buffer: Buffer, contentType: string, folder: string): Promise<StoredImage> => {
  const image = await Image.create({ data: buffer, contentType, size: buffer.length, folder });
  return { url: `/api/images/${image._id}`, publicId: `mongo:${image._id}` };
};

const uploadImage = (buffer: Buffer, contentType: string, folder: string) =>
  imageStorage() === "mongo" ? uploadToMongo(buffer, contentType, folder) : uploadToCloudinary(buffer, folder);

// The id says where the image lives, so images keep working after IMAGE_STORAGE changes.
// "local:" ids are placeholder images from the seed and dev scripts, so there is nothing to delete.
const deleteImage = async (publicId: string) => {
  if (!publicId || publicId.startsWith("local:")) return;
  try {
    if (publicId.startsWith("mongo:")) {
      const id = publicId.slice("mongo:".length);
      if (mongoose.isValidObjectId(id)) await Image.deleteOne({ _id: id });
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // A leftover image is not worth failing the request for.
  }
};

export const uploadAvatar = (buffer: Buffer, contentType: string) =>
  uploadImage(buffer, contentType, "open-margin/avatars");

export const deleteAvatar = deleteImage;

export const uploadCover = (buffer: Buffer, contentType: string) =>
  uploadImage(buffer, contentType, "open-margin/covers");

export const deleteCover = deleteImage;
