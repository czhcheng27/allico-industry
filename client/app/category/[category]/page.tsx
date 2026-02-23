import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/catalog/category-page";
import {
  type CategoryProductFilters,
  fetchCategories,
  fetchCategoryBySlug,
  fetchProductsByCategoryWithFilters,
} from "@/lib/catalog-api";

type CategoryRouteProps = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSingleValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): CategoryProductFilters {
  const keyword = toSingleValue(searchParams.keyword);
  const subcategory = toSingleValue(searchParams.subcategory);
  const inStock = toSingleValue(searchParams.inStock) === "1";
  const wllRangeRaw = toSingleValue(searchParams.wllRange);
  const sortRaw = toSingleValue(searchParams.sort);

  const wllRange =
    wllRangeRaw === "3000-5000" || wllRangeRaw === "5000-10000" || wllRangeRaw === "10000+"
      ? wllRangeRaw
      : undefined;

  const sort =
    sortRaw === "position" ||
    sortRaw === "name" ||
    sortRaw === "price" ||
    sortRaw === "weight"
      ? sortRaw
      : "position";

  return {
    keyword: keyword?.trim() || undefined,
    subcategory: subcategory || undefined,
    inStock,
    wllRange,
    sort,
  };
}

export default async function CategoryRoutePage({
  params,
  searchParams,
}: CategoryRouteProps) {
  const { category: categorySlug } = await params;
  const parsedSearchParams = await searchParams;
  const [category, categories] = await Promise.all([
    fetchCategoryBySlug(categorySlug),
    fetchCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const filters = parseFilters(parsedSearchParams);
  const products = await fetchProductsByCategoryWithFilters(category.slug, filters);

  return (
    <CategoryPage
      categories={categories}
      category={category}
      products={products}
      selectedFilters={filters}
    />
  );
}
