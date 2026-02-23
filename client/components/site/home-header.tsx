import Link from "next/link";

import { getCategoryHref, getSubcategoryHref } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";

async function HomeHeader() {
  const categories = await fetchCategories();

  return (
    <header className="relative z-50 border-b border-zinc-800 bg-zinc-900 text-white shadow-lg">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <div className="mr-8 shrink-0">
          <Link href="/" className="group flex flex-col">
            <div className="font-display text-3xl font-black uppercase leading-none tracking-tighter text-primary">
              <span className="block text-2xl text-white transition-colors group-hover:text-primary">
                Allico
              </span>
              <span className="-mt-2 block text-3xl text-primary transition-colors group-hover:text-white">
                Industries
              </span>
            </div>
          </Link>
        </div>

        <nav className="mr-auto hidden h-full items-center lg:flex">
          <ul className="flex h-full items-center space-x-6 font-display text-sm font-bold uppercase tracking-wide">
            {categories.map((category) => {
              return (
                <li
                  key={category.slug}
                  className="group relative flex h-full items-center"
                >
                  <Link
                    className="flex cursor-pointer items-center py-8 transition hover:text-primary"
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
                              href={getSubcategoryHref(
                                category.slug,
                                subcategory.slug,
                              )}
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
              );
            })}
          </ul>
        </nav>

        <div className="mx-6 hidden max-w-md grow items-center md:flex">
          <form action="/products" className="relative w-full" method="get">
            <input
              className="w-full rounded-sm border border-zinc-700 bg-zinc-800 px-4 py-3 pr-10 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search SKU, Product Name..."
              name="keyword"
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
