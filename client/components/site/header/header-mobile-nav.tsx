"use client";

import { useState } from "react";
import Link from "next/link";

import {
  getCategoryHref,
  getSubcategoryHref,
  type Category,
  type CategorySlug,
} from "@/lib/catalog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type HeaderMobileNavProps = {
  categories: Category[];
  activeCategory?: CategorySlug;
  activePage?: "about" | "contact";
  keyword?: string;
};

function HeaderMobileNav({
  categories,
  activeCategory,
  activePage,
  keyword,
}: HeaderMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<CategorySlug | null>(
    activeCategory ?? null,
  );

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation menu"
          className="text-white transition hover:text-primary lg:hidden"
          type="button"
        >
          <span className="material-symbols-outlined text-[30px]">menu</span>
        </button>
      </SheetTrigger>

      <SheetContent
        className="w-[88vw] max-w-sm gap-0 overflow-hidden border-l border-white/10 bg-brand-ink p-0 text-white"
        side="right"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="font-display text-lg font-black uppercase tracking-[0.18em] text-white">
                Browse
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm text-white/60">
                Explore product categories and company pages.
              </SheetDescription>
            </div>
            <button
              aria-label="Close navigation menu"
              className="rounded-sm border border-white/10 p-2 text-white/70 transition hover:border-primary hover:text-primary"
              onClick={closeMenu}
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </SheetHeader>

        <div className="border-b border-white/10 px-5 py-4">
          <form action="/products" className="relative" method="get">
            <input
              className="w-full rounded-sm border border-white/15 bg-white/8 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/45 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue={keyword ?? ""}
              name="keyword"
              placeholder="Search SKU, Product Name..."
              type="text"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary transition-colors hover:text-white"
              type="submit"
            >
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <nav aria-label="Mobile navigation">
            <ul className="space-y-3">
              {categories.map((category) => {
                const hasSubcategories = category.subcategories.length > 0;
                const isActive = category.slug === activeCategory;
                const isExpanded = expandedCategory === category.slug;

                return (
                  <li
                    key={category.slug}
                    className="overflow-hidden rounded-sm border border-white/10 bg-white/5"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Link
                        className={
                          isActive
                            ? "font-display text-sm font-bold uppercase tracking-[0.14em] text-primary"
                            : "font-display text-sm font-bold uppercase tracking-[0.14em] text-white/88 transition hover:text-primary"
                        }
                        href={getCategoryHref(category.slug)}
                        onClick={closeMenu}
                      >
                        {category.name}
                      </Link>

                      {hasSubcategories ? (
                        <button
                          aria-expanded={isExpanded}
                          aria-label={`Toggle ${category.name} subcategories`}
                          className="ml-auto rounded-sm border border-white/10 p-1 text-white/70 transition hover:border-primary hover:text-primary"
                          onClick={() =>
                            setExpandedCategory((current) =>
                              current === category.slug ? null : category.slug,
                            )
                          }
                          type="button"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isExpanded ? "remove" : "add"}
                          </span>
                        </button>
                      ) : null}
                    </div>

                    {hasSubcategories && isExpanded ? (
                      <div className="border-t border-white/10 px-2 py-2">
                        {category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.slug}
                            className="flex items-center justify-between rounded-sm px-3 py-2 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                            href={getSubcategoryHref(
                              category.slug,
                              subcategory.slug,
                            )}
                            onClick={closeMenu}
                          >
                            <span>{subcategory.name}</span>
                            <span className="material-symbols-outlined text-base text-primary/80">
                              chevron_right
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              className={
                activePage === "about"
                  ? "rounded-sm border border-primary bg-primary/10 px-4 py-3 text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-primary"
                  : "rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-white/85 transition hover:border-primary hover:text-primary"
              }
              href="/about"
              onClick={closeMenu}
            >
              About Us
            </Link>
            <Link
              className={
                activePage === "contact"
                  ? "rounded-sm border border-primary bg-primary/10 px-4 py-3 text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-primary"
                  : "rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-center font-display text-xs font-bold uppercase tracking-[0.18em] text-white/85 transition hover:border-primary hover:text-primary"
              }
              href="/contact"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <Link
            className="flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary-hover"
            href="tel:6047818659"
            onClick={closeMenu}
          >
            <span className="material-symbols-outlined text-base">phone</span>
            Call For Quote
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { HeaderMobileNav };
