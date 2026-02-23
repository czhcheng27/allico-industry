import Link from "next/link";

import { getCategoryHref } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";

async function DetailHeader() {
  const categories = await fetchCategories();

  return (
    <header className="bg-allico-blue text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between border-b border-blue-900/50 px-4 py-2 text-xs text-gray-300">
        <div>PREMIUM INDUSTRIAL LIFTING SOLUTIONS | SINCE 1985</div>
        <div className="flex space-x-6">
          <a className="flex items-center gap-1 transition hover:text-primary" href="#">
            <span className="material-symbols-outlined text-sm">map</span> Distributor Locator
          </a>
          <a className="flex items-center gap-1 transition hover:text-primary" href="#">
            <span className="material-symbols-outlined text-sm">support_agent</span> Contact
            Support
          </a>
          <div className="flex items-center space-x-1 font-bold text-primary">
            <span className="material-symbols-outlined text-sm">call</span>
            <span>(888) 555-0199</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-6">
        <Link className="group flex items-center gap-3" href="/">
          <div className="flex flex-col">
            <div className="font-display text-4xl font-black italic leading-none tracking-tighter text-white transition duration-300 group-hover:text-primary">
              ALLICO
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Industries Inc.
            </div>
          </div>
        </Link>

        <nav className="hidden items-center space-x-8 text-sm font-bold uppercase tracking-wide lg:flex">
          {categories.map((category) => (
            <Link
              key={category.slug}
              className="border-b-2 border-transparent pb-1 transition hover:border-primary hover:text-primary"
              href={getCategoryHref(category.slug)}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <form action="/products" className="relative hidden sm:block" method="get">
            <input
              className="w-48 rounded border border-blue-800 bg-blue-900/50 px-4 py-2 text-sm text-white placeholder-blue-300 transition-all focus:w-64 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search part number..."
              name="keyword"
              type="text"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
              type="submit"
            >
              <span className="material-symbols-outlined text-lg">search</span>
            </button>
          </form>
          <button className="relative text-white hover:text-primary">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-black">
              0
            </span>
          </button>
          <button className="text-white lg:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export { DetailHeader };
