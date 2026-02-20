import mongoose from "mongoose";

const specSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, default: "", trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    price: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    galleryImages: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock"],
      default: "In Stock",
    },
    badge: { type: String, default: "", trim: true },
    listSpecs: { type: [specSchema], default: [] },
    detail: { type: mongoose.Schema.Types.Mixed, default: null },
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

export const Product = mongoose.model("Product", productSchema);
