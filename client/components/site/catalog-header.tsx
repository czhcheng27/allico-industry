import Link from "next/link";

import { type CategorySlug, categories, getCategoryHref } from "@/lib/catalog";

type CatalogHeaderProps = {
  activeCategory?: CategorySlug;
};

function CatalogHeader({ activeCategory }: CatalogHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between bg-black px-4 py-2 text-xs text-white md:px-8 md:text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-bold">ALLICO INDUSTRIES</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Premium Industrial and Towing Equipment</span>
        </div>
        <div className="flex items-center space-x-6">
          <a className="flex items-center gap-1 transition-colors hover:text-primary" href="#">
            <span className="material-symbols-outlined text-[18px]">person</span>
            Account
          </a>
          <a className="flex items-center gap-1 transition-colors hover:text-primary" href="#">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Support
          </a>
        </div>
      </div>

      <div className="border-b border-gray-200 py-5 px-4 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="shrink-0">
            <Link className="group flex items-center gap-3" href="/">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-black">
                <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-tighter text-black">
                  Allico
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Industries
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden space-x-8 font-display text-sm font-bold uppercase tracking-wide md:flex">
            {categories.map((category) => {
              const isActive = category.slug === activeCategory;
              return (
                <Link
                  key={category.slug}
                  className={
                    isActive
                      ? "border-b-2 border-primary pb-1 text-black"
                      : "border-b-2 border-transparent pb-1 text-gray-500 transition-colors hover:border-primary hover:text-primary"
                  }
                  href={getCategoryHref(category.slug)}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>

          <div className="relative w-full shrink-0 md:w-auto">
            <div className="relative">
              <input
                className="w-full rounded-sm border border-gray-200 bg-gray-100 py-2.5 pl-4 pr-12 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary md:w-80"
                placeholder="Search by SKU or Name..."
                type="text"
              />
              <button className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-sm bg-primary px-3 text-black transition-colors hover:bg-primary-hover">
                <span className="material-symbols-outlined text-xl">search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export { CatalogHeader };
