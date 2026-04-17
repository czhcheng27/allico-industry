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

export type ProductFilterAttributes = {
  chainSizeCode?: string;
  chainLengthFt?: number | null;
  strapWidthIn?: number | null;
  strapLengthFt?: number | null;
  strapLengthBucket?: string;
  hookSizeCode?: string;
  hookLengthIn?: number | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  productType?: string;
  sku: string;
  price: string;
  image: string;
  galleryImages?: string[];
  isHotSeller?: boolean;
  displayOrder?: number;
  detailTags?: string[];
  status: "In Stock" | "Low Stock";
  badge?: string;
  listSpecs: ProductSpec[];
  filterAttributes?: ProductFilterAttributes | null;
  detail?: ProductDetail | null;
  createdAt: string;
  updatedAt: string;
};
