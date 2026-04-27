import Link from "next/link";

import { type CategorySlug } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";
import { HeaderBrand } from "@/components/site/header/header-brand";
import { HeaderDesktopNav } from "@/components/site/header/header-desktop-nav";
import { HeaderMobileNav } from "@/components/site/header/header-mobile-nav";
import { HeaderSearchBar } from "@/components/site/header/header-search-bar";

type HomeHeaderProps = {
  activeCategory?: CategorySlug;
  activePage?: "about" | "contact";
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
          <div className="hidden items-center gap-3 min-[480px]:flex md:hidden">
            <Link
              className={
                activePage === "about"
                  ? "font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
                  : "font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:text-primary"
              }
              href="/about"
            >
              About
            </Link>
            <Link
              className={
                activePage === "contact"
                  ? "font-display text-[11px] font-bold uppercase tracking-[0.14em] text-primary"
                  : "font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:text-primary"
              }
              href="/contact"
            >
              Contact
            </Link>
          </div>
          <HeaderMobileNav
            activeCategory={activeCategory}
            activePage={activePage}
            categories={categories}
            keyword={keyword}
          />
          <Link
            className="group hidden flex-col items-center justify-center rounded-sm bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary-hover md:flex"
            href="tel:6047818659"
          >
            <span className="mb-0.5 text-xs font-bold uppercase tracking-wider">
              Call for Quote
            </span>
            <div className="flex items-center font-display text-lg font-black leading-none">
              <span className="material-symbols-outlined mr-1 text-base">
                phone
              </span>
              (604) 781-8659
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { HomeHeader };
