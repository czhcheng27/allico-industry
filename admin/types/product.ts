export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  sku: string;
  price: string;
  image: string;
  galleryImages?: string[];
  status: "In Stock" | "Low Stock";
  badge?: string;
  listSpecs: ProductSpec[];
  detail?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
