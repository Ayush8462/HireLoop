import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { logger } from "./logger.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  logger.info({ cloudName }, "Cloudinary configured successfully");
} else {
  logger.warn(
    "Cloudinary credentials missing in environment variables. Uploads will use development fallback.",
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
}

export const uploadResumeBuffer = async (
  buffer: Buffer,
  originalname: string,
): Promise<CloudinaryUploadResult> => {
  const sanitizedName = originalname
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const publicId = `${sanitizedName}_${Date.now()}`;

  // Check if live Cloudinary credentials are configured
  if (cloudName && apiKey && apiSecret) {
    try {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "hireloop/resumes",
            public_id: publicId,
          },
          (error, res) => {
            if (error || !res) {
              return reject(error || new Error("Cloudinary upload failed"));
            }
            resolve({
              secure_url: res.secure_url,
              public_id: res.public_id,
              format: res.format,
              bytes: res.bytes,
            });
          },
        );

        Readable.from(buffer).pipe(uploadStream);
      });

      logger.info({ publicId: result.public_id }, "Resume uploaded to Cloudinary successfully");
      return result;
    } catch (err: any) {
      logger.warn(
        { error: err?.message || err },
        "Cloudinary upload failed (API credentials mismatch, signature error, or network). Using high-res data URI storage fallback so student resume upload is not blocked.",
      );
    }
  }

  // Resilient Fallback: Data URI stored directly in MongoDB
  const base64Data = buffer.toString("base64");
  const dataUri = `data:application/pdf;base64,${base64Data}`;
  return {
    secure_url: dataUri,
    public_id: `resume_${Date.now()}`,
    bytes: buffer.length,
  };
};

export default cloudinary;
