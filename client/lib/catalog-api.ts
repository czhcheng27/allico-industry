import {
  type Category,
  type CategorySlug,
  type Product,
  categories,
  getCategoryBySlug,
  getProductByCategoryAndSku,
  getProductsByCategory,
  getRelatedProducts,
} from "@/lib/catalog";

const MOCK_API_DELAY_MS = 40;

export type CategoryProductFilters = {
  subcategory?: string;
  inStock?: boolean;
  wllRange?: "3000-5000" | "5000-10000" | "10000+";
  sort?: "position" | "name" | "price" | "weight";
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getSpecValue(product: Product, label: string) {
  return product.listSpecs.find((spec) => spec.label.toLowerCase() === label.toLowerCase())?.value;
}

function extractNumber(raw: string) {
  const matched = raw.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return matched ? Number(matched[1]) : 0;
}

function getWllValue(product: Product) {
  const raw = getSpecValue(product, "WLL") ?? "";
  return extractNumber(raw);
}

function getWeightValue(product: Product) {
  const raw = getSpecValue(product, "Weight") ?? "";
  return extractNumber(raw);
}

function getPriceValue(product: Product) {
  return extractNumber(product.price);
}

function isWithinWllRange(wllValue: number, range: CategoryProductFilters["wllRange"]) {
  if (!range) {
    return true;
  }

  if (range === "3000-5000") {
    return wllValue >= 3000 && wllValue <= 5000;
  }

  if (range === "5000-10000") {
    return wllValue > 5000 && wllValue <= 10000;
  }

  return wllValue > 10000;
}

export async function fetchCategories(): Promise<Category[]> {
  await sleep(MOCK_API_DELAY_MS);
  return categories;
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | undefined> {
  await sleep(MOCK_API_DELAY_MS);
  return getCategoryBySlug(slug);
}

export async function fetchProductsByCategory(category: CategorySlug): Promise<Product[]> {
  await sleep(MOCK_API_DELAY_MS);
  return getProductsByCategory(category);
}

export async function fetchProductsByCategoryWithFilters(
  category: CategorySlug,
  filters: CategoryProductFilters
): Promise<Product[]> {
  await sleep(MOCK_API_DELAY_MS);

  let filtered = getProductsByCategory(category).filter((product) => {
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }

    if (filters.inStock && product.status !== "In Stock") {
      return false;
    }

    if (filters.wllRange) {
      const wllValue = getWllValue(product);
      if (!isWithinWllRange(wllValue, filters.wllRange)) {
        return false;
      }
    }

    return true;
  });

  if (filters.sort === "name") {
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filters.sort === "price") {
    filtered = filtered.sort((a, b) => getPriceValue(a) - getPriceValue(b));
  } else if (filters.sort === "weight") {
    filtered = filtered.sort((a, b) => getWeightValue(a) - getWeightValue(b));
  }

  return filtered;
}

export async function fetchProductByCategoryAndSku(
  category: CategorySlug,
  sku: string
): Promise<Product | undefined> {
  await sleep(MOCK_API_DELAY_MS);
  return getProductByCategoryAndSku(category, sku);
}

export async function fetchRelatedProducts(
  product: Product,
  max = 3
): Promise<Product[]> {
  await sleep(MOCK_API_DELAY_MS);
  return getRelatedProducts(product, max);
}
