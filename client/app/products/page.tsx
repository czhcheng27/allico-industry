import Link from "next/link";

import { ProductListCard } from "@/components/catalog/shared/product-list-card";
import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";
import {
  fetchCategories,
  fetchProductsWithFilters,
  type ProductSearchFilters,
} from "@/lib/catalog-api";

type ProductsRoutePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  const category = toSingleValue(searchParams.category);
  const subcategory = toSingleValue(searchParams.subcategory);
  const inStock = toSingleValue(searchParams.inStock) === "1";
  const wllRangeRaw = toSingleValue(searchParams.wllRange);
  const sortRaw = toSingleValue(searchParams.sort);

  const wllRange =
    wllRangeRaw === "3000-5000" ||
    wllRangeRaw === "5000-10000" ||
    wllRangeRaw === "10000+"
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
    category: category?.trim() || undefined,
    subcategory: subcategory?.trim() || undefined,
    inStock,
    wllRange,
    sort,
  };
}

export default async function ProductsRoutePage({
  searchParams,
}: ProductsRoutePageProps) {
  const parsedSearchParams = await searchParams;
  const filters = parseFilters(parsedSearchParams);
  const [categories, products] = await Promise.all([
    fetchCategories(),
    fetchProductsWithFilters(filters),
  ]);

  const activeCategory = categories.find(
    (category) => category.slug === filters.category,
  );
  const title = filters.keyword ? `Results for "${filters.keyword}"` : "All Products";

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

        <div className="mb-6 border border-gray-200 bg-white p-4 md:p-5">
          <form className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6" method="get">
            <input
              className="rounded-sm border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-black lg:col-span-2"
              defaultValue={filters.keyword ?? ""}
              name="keyword"
              placeholder="Search by SKU or product name"
              type="text"
            />
            <select
              className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-black"
              defaultValue={filters.category ?? ""}
              name="category"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-black"
              defaultValue={filters.subcategory ?? ""}
              name="subcategory"
            >
              <option value="">All Subcategories</option>
              {(activeCategory?.subcategories || []).map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-black"
              defaultValue={filters.wllRange ?? ""}
              name="wllRange"
            >
              <option value="">Any WLL</option>
              <option value="3000-5000">3,000 - 5,000 lbs</option>
              <option value="5000-10000">5,000 - 10,000 lbs</option>
              <option value="10000+">10,000+ lbs</option>
            </select>
            <select
              className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm focus:border-black focus:ring-black"
              defaultValue={filters.sort ?? "position"}
              name="sort"
            >
              <option value="position">Position</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="weight">Weight</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                className="rounded-sm border-gray-300 text-black focus:ring-black"
                defaultChecked={Boolean(filters.inStock)}
                name="inStock"
                type="checkbox"
                value="1"
              />
              In Stock only
            </label>

            <div className="flex gap-2 lg:col-span-2">
              <button
                className="w-full rounded-sm bg-black py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-zinc-800"
                type="submit"
              >
                Apply
              </button>
              <Link
                className="w-full rounded-sm border border-gray-300 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-700 transition hover:border-black hover:text-black"
                href="/products"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        <div className="mb-6 flex flex-col gap-2 border-b border-gray-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-2xl font-black uppercase text-gray-900 md:text-3xl">
              Product Search
            </h1>
            <p className="mt-1 text-sm text-gray-500">{title}</p>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {products.length} item{products.length === 1 ? "" : "s"}
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductListCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="font-display text-lg font-bold uppercase text-gray-900">
              No products found
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing keyword, category, or other filters.
            </p>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
