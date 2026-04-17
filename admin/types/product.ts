export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductDetail = {
  series?: string;
  headline?: string;
  description?: string;
  features?: string[];
  table?: ProductSpec[];
  thumbImages?: string[];
  relatedSlugs?: string[];
  [key: string]: unknown;
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
  isHotSeller?: boolean;
  displayOrder?: number;
  detailTags?: string[];
  status: "In Stock" | "Low Stock" | "Out of Stock";
  badge?: string;
  listSpecs: ProductSpec[];
  detail?: ProductDetail | null;
  createdAt: string;
  updatedAt: string;
};
