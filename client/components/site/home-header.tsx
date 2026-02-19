import Link from "next/link";

import { categories, getCategoryHref, getProductsByCategory, getProductHref } from "@/lib/catalog";

function HomeHeader() {
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
              const categoryProducts = getProductsByCategory(category.slug);
              return (
                <li key={category.slug} className="group relative flex h-full items-center">
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
                    <div className="mega-menu invisible absolute left-0 top-full z-50 w-[800px] translate-y-2 border-t-2 border-primary bg-zinc-900 opacity-0 shadow-2xl transition-all duration-200">
                      <div className="p-8">
                        <div className="grid grid-cols-4 gap-8">
                          {category.subcategories.map((subcategory) => {
                            const scopedProducts = categoryProducts
                              .filter((product) => product.subcategory === subcategory.slug)
                              .slice(0, 4);

                            return (
                              <div key={subcategory.slug}>
                                <h4 className="mb-4 border-b border-zinc-700 pb-2 text-lg text-primary">
                                  {subcategory.name}
                                </h4>
                                <ul className="space-y-2 font-body text-sm font-normal normal-case text-gray-400">
                                  {scopedProducts.length > 0 ? (
                                    scopedProducts.map((product) => (
                                      <li key={product.slug}>
                                        <Link
                                          className="block transition-transform hover:translate-x-1 hover:text-white"
                                          href={getProductHref(product)}
                                        >
                                          {product.name}
                                        </Link>
                                      </li>
                                    ))
                                  ) : (
                                    <li>
                                      <Link
                                        className="block transition-transform hover:translate-x-1 hover:text-white"
                                        href={getCategoryHref(category.slug)}
                                      >
                                        View All
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          })}
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
          <div className="relative w-full">
            <input
              className="w-full rounded-sm border border-zinc-700 bg-zinc-800 px-4 py-3 pr-10 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search SKU, Product Name..."
              type="text"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary transition-colors hover:text-white">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
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
              <span className="material-symbols-outlined mr-1 text-base">phone</span>
              (888) 555-0199
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export { HomeHeader };
