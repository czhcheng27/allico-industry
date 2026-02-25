import { createImageUploadSign, UploadSignError } from "../lib/r2.js";
import {
  discardDraftAssets,
  registerStagedUploadAsset,
} from "../services/upload-asset.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

async function signImageUpload(req, res, module) {
  const { filename, contentType, size, draftId } = req.body || {};
  const normalizedDraftId = String(draftId || "").trim();

  if (!normalizedDraftId) {
    return sendError(res, "draftId is required", 400);
  }

  try {
    const data = await createImageUploadSign({
      module,
      filename,
      contentType,
      size,
    });
    await registerStagedUploadAsset({
      module,
      draftId: normalizedDraftId,
      objectKey: data.objectKey,
      publicUrl: data.publicUrl,
      contentType,
      sizeBytes: Number(size),
      userId: req.user?._id || null,
    });

    return sendSuccess(res, data, "Upload signature generated successfully", 200);
  } catch (error) {
    if (error instanceof UploadSignError) {
      return sendError(res, error.message, error.statusCode);
    }

    console.error(`Sign ${module} image upload error:`, error);
    return sendError(res, "Failed to sign upload request", 500);
  }
}

export const signProductImageUpload = async (req, res) =>
  signImageUpload(req, res, "products");

export const signCategoryImageUpload = async (req, res) =>
  signImageUpload(req, res, "categories");

async function discardImageDraft(req, res, module) {
  const draftId = String(req.body?.draftId || "").trim();
  if (!draftId) {
    return sendError(res, "draftId is required", 400);
  }

  try {
    const data = await discardDraftAssets({
      module,
      draftId,
      userId: req.user?._id || null,
    });
    return sendSuccess(res, data, "Draft uploads discarded successfully", 200);
  } catch (error) {
    console.error(`Discard ${module} draft uploads error:`, error);
    return sendError(res, "Failed to discard draft uploads", 500);
  }
}

export const discardProductImageDraft = async (req, res) =>
  discardImageDraft(req, res, "products");

export const discardCategoryImageDraft = async (req, res) =>
  discardImageDraft(req, res, "categories");
