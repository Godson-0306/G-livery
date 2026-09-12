import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isCloudinaryConfigured, uploadImageBuffer } from "@/lib/cloudinary";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const MAX_BYTES = 4 * 1024 * 1024;

function safeFolder(folder: string) {
  return folder
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");
}

export async function uploadImageFile(file: File, folder: string) {
  if (!(file instanceof File) || file.size === 0) return undefined;
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 4MB or smaller.");
  }

  const mime = file.type.toLowerCase();
  const ext = ALLOWED.get(mime);
  if (!ext) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF image.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const destFolder = safeFolder(folder) || "misc";

  if (isCloudinaryConfigured()) {
    return uploadImageBuffer(buffer, destFolder, mime);
  }

  const filename = `${randomUUID()}.${ext}`;
  const relative = `${destFolder}/${filename}`;
  const dest = path.join(process.cwd(), "uploads", ...relative.split("/"));
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buffer);
  return `/uploads/${relative}`;
}
