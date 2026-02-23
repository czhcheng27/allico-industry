import Link from "next/link";

import { type CategorySlug } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";
import { HeaderBrand } from "@/components/site/header/header-brand";
import { HeaderDesktopNav } from "@/components/site/header/header-desktop-nav";
import { HeaderSearchBar } from "@/components/site/header/header-search-bar";

type HomeHeaderProps = {
  activeCategory?: CategorySlug;
  keyword?: string;
  searchAction?: string;
};

async function HomeHeader({
  activeCategory,
  keyword,
  searchAction = "/products",
}: HomeHeaderProps = {}) {
  const categories = await fetchCategories();

  return (
    <header className="relative z-50 border-b border-zinc-800 bg-zinc-900 text-white shadow-lg">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <HeaderBrand />
        <HeaderDesktopNav categories={categories} activeCategory={activeCategory} />
        <HeaderSearchBar keyword={keyword} searchAction={searchAction} />

        <div className="flex items-center space-x-4">
          <button className="text-white md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link
            className="group hidden flex-col items-center justify-center rounded-sm bg-primary px-6 py-2 text-black transition-colors hover:bg-yellow-400 md:flex"
            href="tel:8885550199"
          >
            <span className="mb-0.5 text-xs font-bold uppercase tracking-wider">
              Call for Quote
            </span>
            <div className="flex items-center font-display text-lg font-black leading-none">
              <span className="material-symbols-outlined mr-1 text-base">
                phone
              </span>
              (888) 555-0199
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { HomeHeader };
