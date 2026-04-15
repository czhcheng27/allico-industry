import Link from "next/link";

import { type CategorySlug } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";
import { HeaderBrand } from "@/components/site/header/header-brand";
import { HeaderDesktopNav } from "@/components/site/header/header-desktop-nav";
import { HeaderSearchBar } from "@/components/site/header/header-search-bar";

type HomeHeaderProps = {
  activeCategory?: CategorySlug;
  activePage?: "about";
  keyword?: string;
};

async function HomeHeader({
  activeCategory,
  activePage,
  keyword,
}: HomeHeaderProps = {}) {
  const categories = await fetchCategories();

  return (
    <header className="relative z-50 border-b border-white/10 bg-brand-ink text-white shadow-lg">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <HeaderBrand />
        <HeaderDesktopNav
          activeCategory={activeCategory}
          activePage={activePage}
          categories={categories}
        />
        <HeaderSearchBar keyword={keyword} />

        <div className="flex items-center space-x-4">
          <Link
            className={
              activePage === "about"
                ? "font-display text-xs font-bold uppercase tracking-[0.16em] text-primary md:hidden"
                : "font-display text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition hover:text-primary md:hidden"
            }
            href="/about"
          >
            About Us
          </Link>
          <button className="text-white md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link
            className="group hidden flex-col items-center justify-center rounded-sm bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary-hover md:flex"
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
