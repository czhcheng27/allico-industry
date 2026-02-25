import mongoose from "mongoose";

export const UPLOAD_ASSET_MODULES = ["products", "categories"];
export const UPLOAD_ASSET_STATUSES = [
  "staged",
  "committed",
  "pending_delete",
  "deleted",
];

const uploadAssetSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      enum: UPLOAD_ASSET_MODULES,
      required: true,
      trim: true,
    },
    draftId: { type: String, default: "", trim: true },
    objectKey: { type: String, required: true, trim: true },
    publicUrl: { type: String, required: true, trim: true },
    contentType: { type: String, default: "", trim: true },
    sizeBytes: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: {
      type: String,
      enum: UPLOAD_ASSET_STATUSES,
      default: "staged",
    },
    deleteAttempts: { type: Number, default: 0, min: 0 },
    lastDeleteError: { type: String, default: "", trim: true },
    committedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

uploadAssetSchema.index({ objectKey: 1 }, { unique: true });
uploadAssetSchema.index({ publicUrl: 1 }, { unique: true });
uploadAssetSchema.index({ module: 1, draftId: 1, status: 1 });
uploadAssetSchema.index({ status: 1, updatedAt: 1 });

export const UploadAsset = mongoose.model("UploadAsset", uploadAssetSchema);
