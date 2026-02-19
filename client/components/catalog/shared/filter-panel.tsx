import Link from "next/link";

import { type Category, getCategoryHref } from "@/lib/catalog";
import { type CategoryProductFilters } from "@/lib/catalog-api";

type FilterPanelProps = {
  categories: Category[];
  activeCategory: Category;
  totalProducts: number;
  selectedFilters: CategoryProductFilters;
};

function FilterPanel({
  categories,
  activeCategory,
  totalProducts,
  selectedFilters,
}: FilterPanelProps) {
  return (
    <aside className="w-full shrink-0 space-y-8 lg:w-64">
      <div className="border border-gray-200 bg-white">
        <h2 className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-3 font-display text-sm font-bold uppercase tracking-wider">
          Categories
          <span className="material-symbols-outlined text-lg">category</span>
        </h2>
        <ul className="text-sm font-medium">
          {categories.map((category) => {
            const isActive = category.slug === activeCategory.slug;
            return (
              <li key={category.slug}>
                <Link
                  className={
                    isActive
                      ? "flex items-center justify-between border-l-4 border-primary bg-primary/10 px-4 py-3 font-bold text-black"
                      : "flex items-center justify-between px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
                  }
                  href={getCategoryHref(category.slug)}
                >
                  <span>{category.name}</span>
                  {isActive ? (
                    <span className="material-symbols-outlined rotate-90 text-sm">
                      expand_more
                    </span>
                  ) : null}
                </Link>
                {isActive && category.subcategories.length > 0 ? (
                  <ul className="bg-gray-50 py-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.slug}>
                        <a
                          className="block px-4 py-2 pl-6 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                          href="#"
                        >
                          {subcategory.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      <form className="border border-gray-200 bg-white p-4" method="get">
        <h3 className="mb-4 border-b border-gray-100 pb-2 font-display text-sm font-bold uppercase">
          Filter By
        </h3>
        <div className="space-y-4">
          {activeCategory.subcategories.length > 0 ? (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">Subcategory</h4>
              <select
                className="form-select w-full rounded-sm border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:ring-black"
                defaultValue={selectedFilters.subcategory ?? ""}
                name="subcategory"
              >
                <option value="">All</option>
                {activeCategory.subcategories.map((subcategory) => (
                  <option key={subcategory.slug} value={subcategory.slug}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">Availability</h4>
            <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
              <input
                className="form-checkbox rounded-sm border-gray-300 text-black focus:ring-black"
                defaultChecked={Boolean(selectedFilters.inStock)}
                name="inStock"
                type="checkbox"
                value="1"
              />
              <span className="text-sm text-gray-600">In Stock ({totalProducts})</span>
            </label>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">
              Working Load Limit
            </h4>
            <div className="space-y-1">
              <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
                <input
                  className="form-radio border-gray-300 text-black focus:ring-black"
                  defaultChecked={selectedFilters.wllRange === "3000-5000"}
                  name="wllRange"
                  type="radio"
                  value="3000-5000"
                />
                <span className="text-sm text-gray-600">3,000 - 5,000 lbs</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
                <input
                  className="form-radio border-gray-300 text-black focus:ring-black"
                  defaultChecked={selectedFilters.wllRange === "5000-10000"}
                  name="wllRange"
                  type="radio"
                  value="5000-10000"
                />
                <span className="text-sm text-gray-600">5,000 - 10,000 lbs</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
                <input
                  className="form-radio border-gray-300 text-black focus:ring-black"
                  defaultChecked={selectedFilters.wllRange === "10000+"}
                  name="wllRange"
                  type="radio"
                  value="10000+"
                />
                <span className="text-sm text-gray-600">10,000+ lbs</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
                <input
                  className="form-radio border-gray-300 text-black focus:ring-black"
                  defaultChecked={!selectedFilters.wllRange}
                  name="wllRange"
                  type="radio"
                  value=""
                />
                <span className="text-sm text-gray-600">Any</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">Sort</h4>
            <select
              className="form-select w-full rounded-sm border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:ring-black"
              defaultValue={selectedFilters.sort ?? "position"}
              name="sort"
            >
              <option value="position">Position</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="weight">Weight</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="w-full rounded-sm bg-black py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-zinc-800"
              type="submit"
            >
              Apply
            </button>
            <Link
              className="w-full rounded-sm border border-gray-300 py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-700 transition hover:border-black hover:text-black"
              href={getCategoryHref(activeCategory.slug)}
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className="group relative overflow-hidden bg-black p-6 text-center text-white">
        <div className="pointer-events-none absolute inset-0 z-20 m-1 border-4 border-primary" />
        <h3 className="relative z-10 mb-2 font-display text-xl font-extrabold uppercase italic">
          Heavy Duty
          <br />
          <span className="text-primary">Reliability</span>
        </h3>
        <p className="relative z-10 mb-4 text-xs text-gray-300">
          Equip your fleet with the industry standard.
        </p>
        <button className="relative z-10 w-full bg-primary py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-white">
          View Catalog
        </button>
      </div>
    </aside>
  );
}

export { FilterPanel };
