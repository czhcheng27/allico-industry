import {
  type Category,
  type CategorySlug,
  type Product,
  featuredProductSlugs,
} from "@/lib/catalog";
import {
  applyCategoryProductFilters,
  type CatalogFilterSelections,
} from "@/lib/catalog-filtering";

const DEFAULT_CATALOG_API_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:9001/api" : "";

const CATALOG_API_BASE_URL =
  process.env.CATALOG_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CATALOG_API_BASE_URL ||
  DEFAULT_CATALOG_API_BASE_URL;

const PUBLIC_PRODUCT_LIST_ENDPOINT = "/products/public/getProductList";
const PUBLIC_CATEGORY_LIST_ENDPOINT = "/categories/public/getCategoryList";
const PUBLIC_CATEGORY_DETAIL_ENDPOINT = "/categories/public/getCategory";
const PAGE_SIZE = 200;

export type CategoryProductFilters = CatalogFilterSelections & {
  keyword?: string;
  inStock?: boolean;
};

export type ProductSearchFilters = CategoryProductFilters & {
  category?: string;
};

type ProductQuery = {
  keyword?: string;
  category?: string;
  status?: string;
};

type ApiResponse<T> = {
  code: number;
  success: boolean;
  message: string;
  data: T | null;
};

type ProductListResponse = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type CategoryListResponse = {
  categories: Category[];
  total: number;
};

function buildApiUrl(
  path: string,
  query: Record<string, string | number | undefined>,
) {
  if (!CATALOG_API_BASE_URL) {
    throw new Error(
      "Missing CATALOG_API_BASE_URL (or NEXT_PUBLIC_CATALOG_API_BASE_URL).",
    );
  }

  const base = CATALOG_API_BASE_URL.endsWith("/")
    ? CATALOG_API_BASE_URL.slice(0, -1)
    : CATALOG_API_BASE_URL;
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return `${base}${path}${queryString ? `?${queryString}` : ""}`;
}

async function requestApi<T>(
  path: string,
  query: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, query), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success || payload.data === null) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data;
}

async function fetchAllProducts(query: ProductQuery = {}) {
  let currentPage = 1;
  let totalPages = 1;
  const products: Product[] = [];

  while (currentPage <= totalPages) {
    const data = await requestApi<ProductListResponse>(
      PUBLIC_PRODUCT_LIST_ENDPOINT,
      {
        ...query,
        page: currentPage,
        pageSize: PAGE_SIZE,
      },
    );

    products.push(...(data.products || []));
    totalPages = data.totalPages || 1;
    currentPage += 1;
  }

  return products;
}

function applyClientFilters(
  source: Product[],
  filters: Pick<
    CategoryProductFilters,
    | "subcategory"
    | "chainSize"
    | "chainLengthFt"
    | "strapWidthIn"
    | "strapLengthBucket"
    | "hookSize"
  >,
) {
  return applyCategoryProductFilters(source, filters);
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const data = await requestApi<CategoryListResponse>(
      PUBLIC_CATEGORY_LIST_ENDPOINT,
      {},
    );
    return data.categories || [];
  } catch (error) {
    console.error("Fetch categories failed:", error);
    return [];
  }
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<Category | undefined> {
  const normalizedSlug = String(slug || "").trim();
  if (!normalizedSlug) {
    return undefined;
  }

  try {
    return await requestApi<Category>(
      `${PUBLIC_CATEGORY_DETAIL_ENDPOINT}/${encodeURIComponent(normalizedSlug)}`,
      {},
    );
  } catch {
    const categories = await fetchCategories();
    return categories.find((category) => category.slug === normalizedSlug);
  }
}

export async function fetchProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return fetchAllProducts({ category });
}

export async function fetchProductsByCategoryWithFilters(
  category: CategorySlug,
  filters: CategoryProductFilters,
): Promise<Product[]> {
  const products = await fetchAllProducts({
    category,
    keyword: filters.keyword?.trim() || undefined,
    status: filters.inStock ? "In Stock" : undefined,
  });

  return applyClientFilters(products, filters);
}

export async function fetchProductsWithFilters(
  filters: ProductSearchFilters,
): Promise<Product[]> {
  const products = await fetchAllProducts({
    category: filters.category?.trim() || undefined,
    keyword: filters.keyword?.trim() || undefined,
    status: filters.inStock ? "In Stock" : undefined,
  });

  return applyClientFilters(products, filters);
}

export async function fetchProductByCategoryAndSku(
  category: CategorySlug,
  sku: string,
): Promise<Product | undefined> {
  const products = await fetchAllProducts({
    category,
    keyword: sku,
  });
  const normalizedSku = sku.trim().toLowerCase();

  return products.find(
    (product) => product.sku.trim().toLowerCase() === normalizedSku,
  );
}

export async function fetchRelatedProducts(
  product: Product,
  max = 3,
): Promise<Product[]> {
  const allProducts = await fetchAllProducts();
  const productBySlug = new Map(
    allProducts.map((item) => [item.slug, item] as const),
  );

  const picked = (product.detail?.relatedSlugs ?? [])
    .map((slug) => productBySlug.get(slug))
    .filter((item): item is Product => {
      if (!item) {
        return false;
      }
      return item.slug !== product.slug;
    });

  if (picked.length >= max) {
    return picked.slice(0, max);
  }

  const pickedSlugSet = new Set(picked.map((item) => item.slug));
  const fallback = allProducts.filter(
    (item) =>
      item.category === product.category &&
      item.slug !== product.slug &&
      !pickedSlugSet.has(item.slug),
  );

  return [...picked, ...fallback].slice(0, max);
}

export async function fetchFeaturedProducts(limit = 5): Promise<Product[]> {
  const allProducts = await fetchAllProducts();
  const productBySlug = new Map(
    allProducts.map((item) => [item.slug, item] as const),
  );

  const picked = featuredProductSlugs
    .map((slug) => productBySlug.get(slug))
    .filter((item): item is Product => Boolean(item));

  if (picked.length >= limit) {
    return picked.slice(0, limit);
  }

  const pickedSlugSet = new Set(picked.map((item) => item.slug));
  const fallback = allProducts.filter((item) => !pickedSlugSet.has(item.slug));
  return [...picked, ...fallback].slice(0, limit);
}
