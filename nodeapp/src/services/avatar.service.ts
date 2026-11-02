import cloudinary from "../config/cloudinary";

export const uploadAvatar = (buffer: Buffer) => {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "open-margin/avatars" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Avatar upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

export const deleteAvatar = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
};
