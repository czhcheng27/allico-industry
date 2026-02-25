import Link from "next/link";

import { FilterLayout } from "@/components/catalog/shared/filter-layout";
import { ProductListCard } from "@/components/catalog/shared/product-list-card";
import { ProductListRow } from "@/components/catalog/shared/product-list-row";
import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";
import { getProductHref, type Product } from "@/lib/catalog";
import {
  fetchProductsWithFilters,
  type ProductSearchFilters,
} from "@/lib/catalog-api";

type ProductsRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
type ProductViewMode = "grid" | "list";

function toSingleValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProductSearchFilters {
  const keyword = toSingleValue(searchParams.keyword);
  const inStock = toSingleValue(searchParams.inStock) === "1";
  const wllRangeRaw = toSingleValue(searchParams.wllRange);
  const priceSortRaw = toSingleValue(searchParams.priceSort);

  const wllRange =
    wllRangeRaw === "3000-5000" ||
    wllRangeRaw === "5000-10000" ||
    wllRangeRaw === "10000+"
      ? wllRangeRaw
      : undefined;

  const priceSort =
    priceSortRaw === "asc" || priceSortRaw === "desc"
      ? priceSortRaw
      : undefined;

  return {
    keyword: keyword?.trim() || undefined,
    category: undefined,
    subcategory: undefined,
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

function buildSearchParams(
  filters: ProductSearchFilters,
  viewMode: ProductViewMode,
) {
  const params = new URLSearchParams();

  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }
  if (filters.inStock) {
    params.set("inStock", "1");
  }
  if (filters.wllRange) {
    params.set("wllRange", filters.wllRange);
  }
  if (filters.priceSort) {
    params.set("priceSort", filters.priceSort);
  }
  if (viewMode === "list") {
    params.set("view", "list");
  }

  return params;
}

function buildPageHref(filters: ProductSearchFilters, viewMode: ProductViewMode) {
  const params = buildSearchParams(filters, viewMode);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function buildProductLinkHref(
  product: Product,
  filters: ProductSearchFilters,
  viewMode: ProductViewMode,
) {
  const params = buildSearchParams(filters, viewMode);
  const query = params.toString();
  const base = getProductHref(product);
  return query ? `${base}?${query}` : base;
}

export default async function ProductsRoutePage({
  searchParams,
}: ProductsRoutePageProps) {
  const parsedSearchParams = await searchParams;
  const filters = parseFilters(parsedSearchParams);
  const viewMode = parseView(parsedSearchParams);
  const products = await fetchProductsWithFilters(filters);
  const title = filters.keyword
    ? `Results for "${filters.keyword}"`
    : "All Products";
  const priceSortLabel =
    filters.priceSort === "asc"
      ? "Low to High"
      : filters.priceSort === "desc"
        ? "High to Low"
        : "Default";

  return (
    <div className="bg-background-light text-text-light">
      <HomeHeader keyword={filters.keyword} />

      <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-black">
        Live Product Catalog | Data Synced From Admin Backend
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 flex text-sm text-gray-500">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                className="inline-flex items-center font-medium transition-colors hover:text-black"
                href="/"
              >
                <span className="material-symbols-outlined mr-1 text-sm">home</span>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined mx-1 text-sm">chevron_right</span>
                <span className="ml-1 font-bold text-black">Products</span>
              </div>
            </li>
          </ol>
        </nav>

        <FilterLayout
          selectedFilters={filters}
          totalProducts={products.length}
          preserveKeyword={filters.keyword}
          resetHref="/products"
          showCategoryInfo={false}
          showSubcategory={false}
        >
          <div className="mb-6 flex flex-col gap-3 border border-gray-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-2xl font-black uppercase text-gray-900 md:text-3xl">
                Product Search
              </h1>
              <p className="mt-1 text-sm text-gray-500">{title}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-600">
                {products.length} item{products.length === 1 ? "" : "s"}
              </div>
              <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
                <span className="font-semibold text-black">Price:</span>
                <span className="rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-1 font-medium">
                  {priceSortLabel}
                </span>
              </div>
              <div className="flex overflow-hidden rounded-sm border border-gray-200">
                <Link
                  aria-label="Grid view"
                  className={
                    viewMode === "grid"
                      ? "inline-flex items-center justify-center bg-black px-2.5 py-1.5 text-white"
                      : "inline-flex items-center justify-center bg-white px-2.5 py-1.5 text-gray-500 transition hover:bg-gray-50 hover:text-black"
                  }
                  href={buildPageHref(filters, "grid")}
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </Link>
                <Link
                  aria-label="List view"
                  className={
                    viewMode === "list"
                      ? "inline-flex items-center justify-center bg-black px-2.5 py-1.5 text-white"
                      : "inline-flex items-center justify-center bg-white px-2.5 py-1.5 text-gray-500 transition hover:bg-gray-50 hover:text-black"
                  }
                  href={buildPageHref(filters, "list")}
                >
                  <span className="material-symbols-outlined text-lg">view_list</span>
                </Link>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductListCard
                    key={product.slug}
                    href={buildProductLinkHref(product, filters, viewMode)}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListRow
                    key={product.slug}
                    href={buildProductLinkHref(product, filters, viewMode)}
                    product={product}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="rounded border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <p className="font-display text-lg font-bold uppercase text-gray-900">
                No products found
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try changing category scope in header navigation or adjust filters.
              </p>
            </div>
          )}
        </FilterLayout>
      </main>

      <HomeFooter />
    </div>
  );
}
