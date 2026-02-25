import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import {
  UploadAsset,
  UPLOAD_ASSET_MODULES,
} from "../models/upload-asset.model.js";
import {
  deleteObjectByKey,
  extractObjectKeyFromPublicUrl,
  isManagedPublicUrl,
} from "../lib/r2.js";

const STATUS_STAGED = "staged";
const STATUS_COMMITTED = "committed";
const STATUS_PENDING_DELETE = "pending_delete";
const STATUS_DELETED = "deleted";

function toTrimmedString(value) {
  return String(value || "").trim();
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function ensureModule(module) {
  const normalized = toTrimmedString(module);
  if (!UPLOAD_ASSET_MODULES.includes(normalized)) {
    throw new Error(`Invalid upload module: ${module}`);
  }
  return normalized;
}

function normalizeUrlList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return [...new Set(values.map(toTrimmedString).filter(Boolean))];
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

async function countReferencesForUrl(publicUrl) {
  const normalizedUrl = toTrimmedString(publicUrl);
  if (!normalizedUrl) {
    return 0;
  }

  const [productCount, categoryCount] = await Promise.all([
    Product.countDocuments({
      $or: [{ image: normalizedUrl }, { galleryImages: normalizedUrl }],
    }),
    Category.countDocuments({ cardImage: normalizedUrl }),
  ]);

  return productCount + categoryCount;
}

async function markAssetDeleted({
  module,
  objectKey,
  publicUrl,
  assetId = null,
  note = "",
}) {
  const normalizedModule = ensureModule(module);
  const normalizedObjectKey = toTrimmedString(objectKey);
  const normalizedPublicUrl = toTrimmedString(publicUrl);

  if (assetId) {
    await UploadAsset.updateOne(
      { _id: assetId },
      {
        $set: {
          status: STATUS_DELETED,
          deletedAt: new Date(),
          lastDeleteError: toTrimmedString(note),
        },
      },
    );
    return;
  }

  await UploadAsset.updateOne(
    { objectKey: normalizedObjectKey },
    {
      $setOnInsert: {
        module: normalizedModule,
        draftId: "",
        objectKey: normalizedObjectKey,
        publicUrl: normalizedPublicUrl,
        contentType: "",
        sizeBytes: 0,
        createdBy: null,
      },
      $set: {
        status: STATUS_DELETED,
        deletedAt: new Date(),
        lastDeleteError: toTrimmedString(note),
      },
    },
    { upsert: true },
  );
}

async function markAssetPendingDelete({
  module,
  objectKey,
  publicUrl,
  assetId = null,
  errorMessage = "",
}) {
  const normalizedModule = ensureModule(module);
  const normalizedObjectKey = toTrimmedString(objectKey);
  const normalizedPublicUrl = toTrimmedString(publicUrl);
  const normalizedError = toTrimmedString(errorMessage);

  if (assetId) {
    await UploadAsset.updateOne(
      { _id: assetId },
      {
        $set: {
          status: STATUS_PENDING_DELETE,
          lastDeleteError: normalizedError,
        },
        $inc: { deleteAttempts: 1 },
      },
    );
    return;
  }

  await UploadAsset.updateOne(
    { objectKey: normalizedObjectKey },
    {
      $setOnInsert: {
        module: normalizedModule,
        draftId: "",
        objectKey: normalizedObjectKey,
        publicUrl: normalizedPublicUrl,
        contentType: "",
        sizeBytes: 0,
        createdBy: null,
      },
      $set: {
        status: STATUS_PENDING_DELETE,
        lastDeleteError: normalizedError,
      },
      $inc: { deleteAttempts: 1 },
    },
    { upsert: true },
  );
}

async function markAssetCommitted(assetId) {
  if (!assetId) {
    return;
  }
  await UploadAsset.updateOne(
    { _id: assetId },
    {
      $set: {
        status: STATUS_COMMITTED,
        committedAt: new Date(),
        lastDeleteError: "",
      },
    },
  );
}

async function deleteManagedUrl({
  module,
  publicUrl,
  assetId = null,
  checkReference = true,
}) {
  const normalizedModule = ensureModule(module);
  const normalizedUrl = toTrimmedString(publicUrl);

  if (!normalizedUrl) {
    return { status: "skipped", reason: "empty-url" };
  }

  if (!isManagedPublicUrl(normalizedUrl)) {
    if (assetId) {
      await markAssetDeleted({
        module: normalizedModule,
        objectKey: "",
        publicUrl: normalizedUrl,
        assetId,
        note: "unmanaged-url",
      });
    }
    return { status: "skipped", reason: "unmanaged-url" };
  }

  if (checkReference) {
    const referenceCount = await countReferencesForUrl(normalizedUrl);
    if (referenceCount > 0) {
      await markAssetCommitted(assetId);
      return { status: "kept", reason: "still-referenced" };
    }
  }

  const objectKey = extractObjectKeyFromPublicUrl(normalizedUrl);
  if (!objectKey) {
    if (assetId) {
      await markAssetPendingDelete({
        module: normalizedModule,
        objectKey: "",
        publicUrl: normalizedUrl,
        assetId,
        errorMessage: "Invalid managed URL: cannot resolve object key",
      });
    }
    return { status: "pending_delete", reason: "invalid-object-key" };
  }

  try {
    await deleteObjectByKey(objectKey);
    await markAssetDeleted({
      module: normalizedModule,
      objectKey,
      publicUrl: normalizedUrl,
      assetId,
    });
    return { status: "deleted" };
  } catch (error) {
    await markAssetPendingDelete({
      module: normalizedModule,
      objectKey,
      publicUrl: normalizedUrl,
      assetId,
      errorMessage: getErrorMessage(error),
    });
    return { status: STATUS_PENDING_DELETE, reason: getErrorMessage(error) };
  }
}

export function collectProductManagedImageUrls(input) {
  const image = toTrimmedString(input?.image);
  const gallery = normalizeUrlList(input?.galleryImages || []);
  const all = image ? [image, ...gallery] : gallery;
  return all.filter((url) => isManagedPublicUrl(url));
}

export function collectCategoryManagedImageUrls(input) {
  const cardImage = toTrimmedString(input?.cardImage);
  if (!cardImage || !isManagedPublicUrl(cardImage)) {
    return [];
  }
  return [cardImage];
}

export async function registerStagedUploadAsset({
  module,
  draftId,
  objectKey,
  publicUrl,
  contentType,
  sizeBytes,
  userId,
}) {
  const normalizedModule = ensureModule(module);
  const normalizedDraftId = toTrimmedString(draftId);
  const normalizedObjectKey = toTrimmedString(objectKey);
  const normalizedPublicUrl = toTrimmedString(publicUrl);

  if (!normalizedDraftId) {
    throw new Error("draftId is required");
  }
  if (!normalizedObjectKey) {
    throw new Error("objectKey is required");
  }
  if (!normalizedPublicUrl || !isManagedPublicUrl(normalizedPublicUrl)) {
    throw new Error("publicUrl must be a managed R2 URL");
  }

  const normalizedContentType = toTrimmedString(contentType);
  const normalizedSize = Number(sizeBytes);

  return UploadAsset.findOneAndUpdate(
    { objectKey: normalizedObjectKey },
    {
      $set: {
        module: normalizedModule,
        draftId: normalizedDraftId,
        objectKey: normalizedObjectKey,
        publicUrl: normalizedPublicUrl,
        contentType: normalizedContentType,
        sizeBytes:
          Number.isFinite(normalizedSize) && normalizedSize >= 0 ? normalizedSize : 0,
        createdBy: userId || null,
        status: STATUS_STAGED,
        committedAt: null,
        deletedAt: null,
        deleteAttempts: 0,
        lastDeleteError: "",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
}

export async function finalizeDraftAssets({
  module,
  draftId,
  userId,
  usedUrls = [],
}) {
  const normalizedModule = ensureModule(module);
  const normalizedDraftId = toTrimmedString(draftId);
  if (!normalizedDraftId || !userId) {
    return {
      committed: 0,
      deleted: 0,
      kept: 0,
      pendingDelete: 0,
    };
  }

  const managedUsedUrls = normalizeUrlList(usedUrls).filter((url) =>
    isManagedPublicUrl(url),
  );

  let committed = 0;
  if (managedUsedUrls.length > 0) {
    const commitResult = await UploadAsset.updateMany(
      {
        module: normalizedModule,
        draftId: normalizedDraftId,
        createdBy: userId,
        status: STATUS_STAGED,
        publicUrl: { $in: managedUsedUrls },
      },
      {
        $set: {
          status: STATUS_COMMITTED,
          committedAt: new Date(),
          lastDeleteError: "",
        },
      },
    );
    committed = commitResult.modifiedCount || 0;
  }

  const staleDraftAssets = await UploadAsset.find({
    module: normalizedModule,
    draftId: normalizedDraftId,
    createdBy: userId,
    status: STATUS_STAGED,
  });

  let deleted = 0;
  let kept = 0;
  let pendingDelete = 0;

  for (const asset of staleDraftAssets) {
    const result = await deleteManagedUrl({
      module: normalizedModule,
      publicUrl: asset.publicUrl,
      assetId: asset._id,
      checkReference: true,
    });
    if (result.status === "deleted") {
      deleted += 1;
      continue;
    }
    if (result.status === "kept") {
      kept += 1;
      continue;
    }
    if (result.status === STATUS_PENDING_DELETE) {
      pendingDelete += 1;
    }
  }

  return {
    committed,
    deleted,
    kept,
    pendingDelete,
  };
}

export async function discardDraftAssets({ module, draftId, userId }) {
  const normalizedModule = ensureModule(module);
  const normalizedDraftId = toTrimmedString(draftId);
  if (!normalizedDraftId || !userId) {
    return {
      total: 0,
      deleted: 0,
      kept: 0,
      pendingDelete: 0,
    };
  }

  const stagedAssets = await UploadAsset.find({
    module: normalizedModule,
    draftId: normalizedDraftId,
    createdBy: userId,
    status: STATUS_STAGED,
  });

  let deleted = 0;
  let kept = 0;
  let pendingDelete = 0;

  for (const asset of stagedAssets) {
    const result = await deleteManagedUrl({
      module: normalizedModule,
      publicUrl: asset.publicUrl,
      assetId: asset._id,
      checkReference: true,
    });
    if (result.status === "deleted") {
      deleted += 1;
      continue;
    }
    if (result.status === "kept") {
      kept += 1;
      continue;
    }
    if (result.status === STATUS_PENDING_DELETE) {
      pendingDelete += 1;
    }
  }

  return {
    total: stagedAssets.length,
    deleted,
    kept,
    pendingDelete,
  };
}

export async function cleanupUnreferencedManagedUrls({ module, urls = [] }) {
  const normalizedModule = ensureModule(module);
  const uniqueUrls = normalizeUrlList(urls).filter((url) => isManagedPublicUrl(url));

  let deleted = 0;
  let kept = 0;
  let pendingDelete = 0;

  for (const url of uniqueUrls) {
    const result = await deleteManagedUrl({
      module: normalizedModule,
      publicUrl: url,
      checkReference: true,
    });
    if (result.status === "deleted") {
      deleted += 1;
      continue;
    }
    if (result.status === "kept") {
      kept += 1;
      continue;
    }
    if (result.status === STATUS_PENDING_DELETE) {
      pendingDelete += 1;
    }
  }

  return {
    total: uniqueUrls.length,
    deleted,
    kept,
    pendingDelete,
  };
}

export async function cleanupStaleUploadAssets({
  stagedMaxAgeHours = 24,
  limit = 200,
} = {}) {
  const normalizedLimit = toPositiveInt(limit, 200);
  const normalizedHours = toPositiveInt(stagedMaxAgeHours, 24);
  const cutoff = new Date(Date.now() - normalizedHours * 60 * 60 * 1000);

  const candidates = await UploadAsset.find({
    $or: [
      { status: STATUS_STAGED, updatedAt: { $lt: cutoff } },
      { status: STATUS_PENDING_DELETE },
    ],
  })
    .sort({ updatedAt: 1 })
    .limit(normalizedLimit);

  let deleted = 0;
  let kept = 0;
  let pendingDelete = 0;

  for (const asset of candidates) {
    const candidateModule = UPLOAD_ASSET_MODULES.includes(asset.module)
      ? asset.module
      : "products";
    const result = await deleteManagedUrl({
      module: candidateModule,
      publicUrl: asset.publicUrl,
      assetId: asset._id,
      checkReference: true,
    });

    if (result.status === "deleted") {
      deleted += 1;
      continue;
    }
    if (result.status === "kept") {
      kept += 1;
      continue;
    }
    if (result.status === STATUS_PENDING_DELETE) {
      pendingDelete += 1;
    }
  }

  return {
    processed: candidates.length,
    deleted,
    kept,
    pendingDelete,
  };
}
