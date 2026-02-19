import Link from "next/link";

import { FilterPanel } from "@/components/catalog/shared/filter-panel";
import { ProductListCard } from "@/components/catalog/shared/product-list-card";
import { CatalogFooter } from "@/components/site/catalog-footer";
import { CatalogHeader } from "@/components/site/catalog-header";
import {
  type Category,
  categories,
  type Product,
} from "@/lib/catalog";
import { type CategoryProductFilters } from "@/lib/catalog-api";

type CategoryPageProps = {
  category: Category;
  products: Product[];
  selectedFilters: CategoryProductFilters;
};

function CategoryPage({ category, products, selectedFilters }: CategoryPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background-light font-body text-text-light">
      <CatalogHeader activeCategory={category.slug} />

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
            totalProducts={products.length}
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
                <a className="cursor-not-allowed rounded-sm border border-gray-200 p-2 text-gray-400" href="#">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </a>
                <a className="rounded-sm bg-black px-4 py-2 text-sm font-bold text-white" href="#">
                  1
                </a>
                <a className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" href="#">
                  2
                </a>
                <a className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" href="#">
                  3
                </a>
                <a className="rounded-sm border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 hover:text-primary" href="#">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
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
