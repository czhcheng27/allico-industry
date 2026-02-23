import Link from "next/link";

import { FilterLayout } from "@/components/catalog/shared/filter-layout";
import { ProductListCard } from "@/components/catalog/shared/product-list-card";
import { ProductListRow } from "@/components/catalog/shared/product-list-row";
import { CatalogFooter } from "@/components/site/catalog-footer";
import { HomeHeader } from "@/components/site/home-header";
import {
  type Category,
  getCategoryHref,
  getProductHref,
  type Product,
} from "@/lib/catalog";
import { type CategoryProductFilters } from "@/lib/catalog-api";

type CategoryPageProps = {
  category: Category;
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  selectedFilters: CategoryProductFilters;
  viewMode: "grid" | "list";
};

function buildSearchParams(
  selectedFilters: CategoryProductFilters,
  page: number,
  viewMode: "grid" | "list",
) {
  const params = new URLSearchParams();

  if (selectedFilters.keyword) {
    params.set("keyword", selectedFilters.keyword);
  }
  if (selectedFilters.subcategory) {
    params.set("subcategory", selectedFilters.subcategory);
  }
  if (selectedFilters.inStock) {
    params.set("inStock", "1");
  }
  if (selectedFilters.wllRange) {
    params.set("wllRange", selectedFilters.wllRange);
  }
  if (selectedFilters.priceSort) {
    params.set("priceSort", selectedFilters.priceSort);
  }
  if (viewMode === "list") {
    params.set("view", "list");
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  return params;
}

function buildPageHref(
  categorySlug: string,
  selectedFilters: CategoryProductFilters,
  page: number,
  viewMode: "grid" | "list",
) {
  const params = buildSearchParams(selectedFilters, page, viewMode);
  const query = params.toString();
  return query ? `/category/${categorySlug}?${query}` : `/category/${categorySlug}`;
}

function buildProductHref(
  product: Product,
  selectedFilters: CategoryProductFilters,
  page: number,
  viewMode: "grid" | "list",
) {
  const params = buildSearchParams(selectedFilters, page, viewMode);
  const query = params.toString();
  const base = getProductHref(product);
  return query ? `${base}?${query}` : base;
}

function CategoryPage({
  category,
  products,
  totalProducts,
  currentPage,
  totalPages,
  selectedFilters,
  viewMode,
}: CategoryPageProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);
  const priceSortLabel =
    selectedFilters.priceSort === "asc"
      ? "Low to High"
      : selectedFilters.priceSort === "desc"
        ? "High to Low"
        : "Default";

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-body text-text-light">
      <HomeHeader
        activeCategory={category.slug}
        keyword={selectedFilters.keyword}
      />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 md:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex text-sm text-gray-500">
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
                <span className="ml-1 font-bold text-black">{category.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <FilterLayout
          activeCategory={category}
          selectedFilters={selectedFilters}
          totalProducts={totalProducts}
          preserveKeyword={selectedFilters.keyword}
          resetHref={getCategoryHref(category.slug)}
        >
          <div className="mb-6 flex flex-col items-center justify-between gap-3 border border-gray-200 bg-white p-4 md:flex-row">
            <div>
              <h1 className="font-display text-2xl font-black uppercase tracking-tight text-gray-900">
                {category.name} Equipment
              </h1>
              <p className="mt-1 text-xs text-gray-500">{category.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  href={buildPageHref(
                    category.slug,
                    selectedFilters,
                    currentPage,
                    "grid",
                  )}
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
                  href={buildPageHref(
                    category.slug,
                    selectedFilters,
                    currentPage,
                    "list",
                  )}
                >
                  <span className="material-symbols-outlined text-lg">view_list</span>
                </Link>
              </div>
            </div>
          </div>

          {products.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductListCard
                    key={product.slug}
                    product={product}
                    href={buildProductHref(
                      product,
                      selectedFilters,
                      currentPage,
                      viewMode,
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <ProductListRow
                    key={product.slug}
                    product={product}
                    href={buildProductHref(
                      product,
                      selectedFilters,
                      currentPage,
                      viewMode,
                    )}
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
                Try adjusting filters to expand your results.
              </p>
            </div>
          )}

          <div className="mt-12 flex justify-center border-t border-gray-200 pt-8">
            <nav className="flex items-center space-x-1">
              {currentPage > 1 ? (
                <Link
                  className="rounded-sm border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 hover:text-primary"
                  href={buildPageHref(
                    category.slug,
                    selectedFilters,
                    previousPage,
                    viewMode,
                  )}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-sm border border-gray-200 p-2 text-gray-400">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </span>
              )}

              {pageNumbers.map((page) => (
                <Link
                  key={page}
                  className={
                    page === currentPage
                      ? "rounded-sm bg-black px-4 py-2 text-sm font-bold text-white"
                      : "rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  }
                  href={buildPageHref(category.slug, selectedFilters, page, viewMode)}
                >
                  {page}
                </Link>
              ))}

              {currentPage < totalPages ? (
                <Link
                  className="rounded-sm border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 hover:text-primary"
                  href={buildPageHref(
                    category.slug,
                    selectedFilters,
                    nextPage,
                    viewMode,
                  )}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-sm border border-gray-200 p-2 text-gray-400">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </span>
              )}
            </nav>
          </div>
        </FilterLayout>
      </main>

      <CatalogFooter />
    </div>
  );
}

export { CategoryPage };
