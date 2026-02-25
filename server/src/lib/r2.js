import { randomUUID } from "crypto";
import path from "path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const EXTENSIONS_BY_CONTENT_TYPE = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
};

const ALLOWED_MODULES = new Set(["products", "categories"]);

function getRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new UploadSignError(`Missing required env var: ${name}`, 500);
  }
  return value;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function getEnvironmentSegment() {
  const raw = String(process.env.NODE_ENV || "development")
    .trim()
    .toLowerCase();
  if (raw === "production") {
    return "prod";
  }
  if (raw === "test") {
    return "test";
  }
  if (raw === "development") {
    return "dev";
  }
  return raw.replace(/[^a-z0-9-]/g, "") || "dev";
}

function resolveExtension(filename, contentType) {
  const allowedExtensions = EXTENSIONS_BY_CONTENT_TYPE[contentType];
  const extension = path.extname(String(filename || "")).toLowerCase();

  if (!allowedExtensions) {
    throw new UploadSignError("Unsupported contentType", 400);
  }

  if (!extension) {
    return allowedExtensions[0];
  }

  if (!allowedExtensions.includes(extension)) {
    throw new UploadSignError("File extension does not match contentType", 400);
  }

  return extension;
}

function buildObjectKey(module, extension) {
  if (!ALLOWED_MODULES.has(module)) {
    throw new UploadSignError("Invalid upload module", 400);
  }

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const env = getEnvironmentSegment();

  return `${env}/${module}/${year}/${month}/${randomUUID()}${extension}`;
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}

function buildPublicUrl(baseUrl, objectKey) {
  return `${normalizeBaseUrl(baseUrl)}/${objectKey}`;
}

function createS3Client(accountId, accessKeyId, secretAccessKey) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function getR2Config() {
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = getRequiredEnv("R2_BUCKET");
  const publicBaseUrl =
    String(process.env.R2_PUBLIC_BASE_URL || "").trim() ||
    `https://${bucket}.${accountId}.r2.dev`;
  const signExpiresSeconds = parsePositiveInt(
    process.env.R2_SIGN_EXPIRES_SECONDS,
    60,
  );
  const maxFileSizeMb = parsePositiveInt(process.env.R2_MAX_FILE_SIZE_MB, 5);

  return {
    bucket,
    publicBaseUrl,
    signExpiresSeconds,
    maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
    client: createS3Client(accountId, accessKeyId, secretAccessKey),
  };
}

function getManagedPublicBaseUrl() {
  const explicitPublicBaseUrl = String(process.env.R2_PUBLIC_BASE_URL || "").trim();
  if (explicitPublicBaseUrl) {
    return normalizeBaseUrl(explicitPublicBaseUrl);
  }

  const bucket = getRequiredEnv("R2_BUCKET");
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  return normalizeBaseUrl(`https://${bucket}.${accountId}.r2.dev`);
}

export class UploadSignError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "UploadSignError";
    this.statusCode = statusCode;
  }
}

export async function createImageUploadSign({
  module,
  filename,
  contentType,
  size,
}) {
  const config = getR2Config();

  if (!filename || typeof filename !== "string") {
    throw new UploadSignError("filename is required", 400);
  }

  if (!contentType || typeof contentType !== "string") {
    throw new UploadSignError("contentType is required", 400);
  }

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new UploadSignError(
      "Unsupported image type. Allowed: jpg, png, webp, avif",
      400,
    );
  }

  const normalizedSize = Number(size);
  if (!Number.isFinite(normalizedSize) || normalizedSize <= 0) {
    throw new UploadSignError("size must be a positive number", 400);
  }

  if (normalizedSize > config.maxFileSizeBytes) {
    throw new UploadSignError(
      `Image size exceeds limit (${Math.round(
        config.maxFileSizeBytes / (1024 * 1024),
      )}MB)`,
      400,
    );
  }

  const extension = resolveExtension(filename, contentType);
  const objectKey = buildObjectKey(module, extension);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(config.client, command, {
    expiresIn: config.signExpiresSeconds,
  });

  return {
    uploadUrl,
    publicUrl: buildPublicUrl(config.publicBaseUrl, objectKey),
    objectKey,
    headers: {
      "Content-Type": contentType,
    },
  };
}

export function isManagedPublicUrl(url) {
  const normalizedUrl = String(url || "").trim();
  if (!normalizedUrl) {
    return false;
  }

  let managedBaseUrl = "";
  try {
    managedBaseUrl = getManagedPublicBaseUrl();
  } catch (_error) {
    return false;
  }

  return normalizedUrl.startsWith(`${managedBaseUrl}/`);
}

export function extractObjectKeyFromPublicUrl(url) {
  const normalizedUrl = String(url || "").trim();
  if (!isManagedPublicUrl(normalizedUrl)) {
    return null;
  }

  const managedBaseUrl = getManagedPublicBaseUrl();
  const objectKey = normalizedUrl.slice(managedBaseUrl.length + 1).trim();
  return objectKey || null;
}

export async function deleteObjectByKey(objectKey) {
  const normalizedObjectKey = String(objectKey || "").trim();
  if (!normalizedObjectKey) {
    throw new UploadSignError("objectKey is required", 400);
  }

  const config = getR2Config();
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: normalizedObjectKey,
  });

  await config.client.send(command);
}
