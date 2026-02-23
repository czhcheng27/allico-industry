import Link from "next/link";

import {
  getCategoryHref,
  getSubcategoryHref,
  type Category,
  type CategorySlug,
} from "@/lib/catalog";

type HeaderDesktopNavProps = {
  categories: Category[];
  activeCategory?: CategorySlug;
};

function HeaderDesktopNav({ categories, activeCategory }: HeaderDesktopNavProps) {
  return (
    <nav className="mr-auto hidden h-full items-center lg:flex">
      <ul className="flex h-full items-center space-x-6 font-display text-sm font-bold uppercase tracking-wide">
        {categories.map((category) => (
          <li key={category.slug} className="group relative flex h-full items-center">
            <Link
              className={
                category.slug === activeCategory
                  ? "flex cursor-pointer items-center py-8 text-primary"
                  : "flex cursor-pointer items-center py-8 transition hover:text-primary"
              }
              href={getCategoryHref(category.slug)}
            >
              {category.name}
              {category.subcategories.length > 0 ? (
                <span className="material-symbols-outlined ml-1 text-sm text-zinc-500 transition-transform group-hover:rotate-180 group-hover:text-primary">
                  expand_more
                </span>
              ) : null}
            </Link>

            {category.subcategories.length > 0 ? (
              <div className="mega-menu invisible absolute left-0 top-full z-50 w-160 translate-y-2 rounded-b-md border border-zinc-700 border-t-2 border-t-primary bg-zinc-900/95 opacity-0 shadow-2xl backdrop-blur transition-all duration-200">
                <div className="border-b border-zinc-700/80 px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Browse {category.name}
                  </p>
                  <Link
                    className="mt-1 inline-flex items-center text-base font-semibold normal-case text-primary transition hover:text-yellow-300"
                    href={getCategoryHref(category.slug)}
                  >
                    View all {category.name}
                    <span className="material-symbols-outlined ml-1 text-base">
                      arrow_forward
                    </span>
                  </Link>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        className="group/item flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-800/70 px-4 py-3 text-left normal-case transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-zinc-800"
                        href={getSubcategoryHref(category.slug, subcategory.slug)}
                      >
                        <span className="font-body text-sm font-semibold text-zinc-200 transition group-hover/item:text-white">
                          {subcategory.name}
                        </span>
                        <span className="material-symbols-outlined text-base text-zinc-500 transition group-hover/item:text-primary">
                          chevron_right
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { HeaderDesktopNav };
