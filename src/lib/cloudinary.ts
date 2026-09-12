import { v2 as cloudinary } from "cloudinary";

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function isCloudinaryConfigured() {
  return configured();
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
  mime = "image/jpeg",
) {
  if (!configured()) {
    throw new Error("Image uploads are not configured yet.");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `g-livery/${folder}`,
    resource_type: "image",
  });

  return result.secure_url as string;
}
