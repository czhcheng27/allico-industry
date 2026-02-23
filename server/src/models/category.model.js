import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    cardImage: { type: String, default: "", trim: true },
    icon: { type: String, default: "category", trim: true },
    sortOrder: { type: Number, default: 0 },
    subcategories: { type: [subcategorySchema], default: [] },
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

export const Category = mongoose.model("Category", categorySchema);
