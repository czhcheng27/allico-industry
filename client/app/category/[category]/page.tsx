import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/catalog/category-page";
import {
  type CategoryProductFilters,
  fetchCategoryBySlug,
  fetchProductsByCategoryWithFilters,
} from "@/lib/catalog-api";

type CategoryRouteProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const CATEGORY_PAGE_SIZE = 9;
type ProductViewMode = "grid" | "list";

function toSingleValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): CategoryProductFilters {
  const keyword = toSingleValue(searchParams.keyword);
  const subcategory = toSingleValue(searchParams.subcategory);
  const inStock = toSingleValue(searchParams.inStock) === "1";
  const wllRangeRaw = toSingleValue(searchParams.wllRange);
  const priceSortRaw = toSingleValue(searchParams.priceSort);

  const wllRange =
    wllRangeRaw === "3000-5000" || wllRangeRaw === "5000-10000" || wllRangeRaw === "10000+"
      ? wllRangeRaw
      : undefined;

  const priceSort =
    priceSortRaw === "asc" || priceSortRaw === "desc"
      ? priceSortRaw
      : undefined;

  return {
    keyword: keyword?.trim() || undefined,
    subcategory: subcategory || undefined,
    inStock,
    wllRange,
    priceSort,
  };
}

function parseView(
  searchParams: Record<string, string | string[] | undefined>,
): ProductViewMode {
  const viewRaw = toSingleValue(searchParams.view);
  return viewRaw === "list" ? "list" : "grid";
}

export default async function CategoryRoutePage({
  params,
  searchParams,
}: CategoryRouteProps) {
  const { category: categorySlug } = await params;
  const parsedSearchParams = await searchParams;
  const page = parsePage(toSingleValue(parsedSearchParams.page));
  const category = await fetchCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const filters = parseFilters(parsedSearchParams);
  const viewMode = parseView(parsedSearchParams);
  const filteredProducts = await fetchProductsByCategoryWithFilters(
    category.slug,
    filters,
  );
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / CATEGORY_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * CATEGORY_PAGE_SIZE;
  const products = filteredProducts.slice(start, start + CATEGORY_PAGE_SIZE);

  return (
    <CategoryPage
      category={category}
      products={products}
      totalProducts={totalProducts}
      currentPage={currentPage}
      totalPages={totalPages}
      selectedFilters={filters}
      viewMode={viewMode}
    />
  );
}
