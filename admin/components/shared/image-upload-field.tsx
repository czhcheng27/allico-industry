"use client";

import { useRef, useState, type ChangeEvent } from "react";
import axios from "axios";
import { Button, Image, Input, Progress, Space, Typography, message } from "antd";
import type {
  ImageUploadSignPayload,
  ImageUploadSignResult,
} from "@/lib/api";
import type { ApiResponse } from "@/types/api";

const { Text } = Typography;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";

type ImageUploadFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  draftId: string;
  signApi: (
    payload: ImageUploadSignPayload,
  ) => Promise<ApiResponse<ImageUploadSignResult>>;
};

export function ImageUploadField({
  value = "",
  onChange,
  disabled = false,
  maxSizeMB = 5,
  draftId,
  signApi,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const handleSelectFile = () => {
    if (disabled || uploading) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (disabled || uploading) {
      return;
    }
    onChange?.("");
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
      message.error("Unsupported image type. Allowed: JPG, PNG, WEBP, AVIF.");
      return;
    }

    if (file.size > maxBytes) {
      message.error(`Image size exceeds limit (${maxSizeMB}MB).`);
      return;
    }

    if (!draftId) {
      message.error("Upload session expired. Please reopen the form and try again.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const signResponse = await signApi({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        draftId,
      });

      const { uploadUrl, publicUrl, headers } = signResponse.data;

      await axios.put(uploadUrl, file, {
        headers,
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const nextProgress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          setUploadProgress(Math.min(100, Math.max(0, nextProgress)));
        },
      });

      setUploadProgress(100);
      onChange?.(publicUrl);
      message.success("Image uploaded successfully.");
    } catch (error) {
      console.error("Image upload failed:", error);
      message.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Space wrap>
        <Button onClick={handleSelectFile} loading={uploading} disabled={disabled}>
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        <Button onClick={handleRemove} disabled={disabled || uploading || !value}>
          Remove
        </Button>
      </Space>

      {uploading ? <Progress percent={uploadProgress} size="small" /> : null}

      <Input value={value} readOnly placeholder="Uploaded image URL will appear here." />

      {value ? (
        <Image
          src={value}
          alt="Uploaded image"
          width={120}
          height={120}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ) : (
        <Text type="secondary">{`Supports JPG, PNG, WEBP, AVIF up to ${maxSizeMB}MB.`}</Text>
      )}
    </div>
  );
}
