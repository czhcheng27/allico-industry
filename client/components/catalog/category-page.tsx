import Link from "next/link";

import { FilterPanel } from "@/components/catalog/shared/filter-panel";
import { ProductListCard } from "@/components/catalog/shared/product-list-card";
import { CatalogFooter } from "@/components/site/catalog-footer";
import { CatalogHeader } from "@/components/site/catalog-header";
import {
  type Category,
  type Product,
} from "@/lib/catalog";
import { type CategoryProductFilters } from "@/lib/catalog-api";

type CategoryPageProps = {
  categories: Category[];
  category: Category;
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  selectedFilters: CategoryProductFilters;
};

function buildPageHref(
  categorySlug: string,
  selectedFilters: CategoryProductFilters,
  page: number,
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
  if (selectedFilters.sort && selectedFilters.sort !== "position") {
    params.set("sort", selectedFilters.sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/category/${categorySlug}?${query}` : `/category/${categorySlug}`;
}

function CategoryPage({
  categories,
  category,
  products,
  totalProducts,
  currentPage,
  totalPages,
  selectedFilters,
}: CategoryPageProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <div className="flex min-h-screen flex-col bg-background-light font-body text-text-light">
      <CatalogHeader activeCategory={category.slug} keyword={selectedFilters.keyword} />

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

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterPanel
            activeCategory={category}
            categories={categories}
            selectedFilters={selectedFilters}
            totalProducts={totalProducts}
          />

          <div className="flex-1">
            <div className="mb-6 flex flex-col items-center justify-between border border-gray-200 bg-white p-4 md:flex-row">
              <div>
                <h1 className="font-display text-2xl font-black uppercase tracking-tight text-gray-900">
                  {category.name} Equipment
                </h1>
                <p className="mt-1 text-xs text-gray-500">{category.description}</p>
              </div>
              <div className="mt-4 flex items-center space-x-4 md:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="font-bold text-black">Sort By:</span>
                  <span className="rounded-sm bg-gray-100 px-3 py-1 font-medium capitalize">
                    {selectedFilters.sort ?? "position"}
                  </span>
                </div>
                <div className="flex space-x-1 border-l border-gray-200 pl-4">
                  <button className="rounded-sm bg-gray-100 p-1 text-black">
                    <span className="material-symbols-outlined text-lg">grid_view</span>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-black">
                    <span className="material-symbols-outlined text-lg">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductListCard key={product.slug} product={product} />
              ))}
            </div>

            <div className="mt-12 flex justify-center border-t border-gray-200 pt-8">
              <nav className="flex items-center space-x-1">
                {currentPage > 1 ? (
                  <Link
                    className="rounded-sm border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 hover:text-primary"
                    href={buildPageHref(category.slug, selectedFilters, previousPage)}
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
                    href={buildPageHref(category.slug, selectedFilters, page)}
                  >
                    {page}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link
                    className="rounded-sm border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 hover:text-primary"
                    href={buildPageHref(category.slug, selectedFilters, nextPage)}
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
          </div>
        </div>
      </main>

      <CatalogFooter />
    </div>
  );
}

export { CategoryPage };
