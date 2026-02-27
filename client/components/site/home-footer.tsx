import Link from "next/link";

import { getCategoryHref } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";

async function HomeFooter() {
  const categories = await fetchCategories();

  return (
    <footer className="border-t border-black bg-zinc-900 pb-8 pt-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6 flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="font-display text-2xl font-black uppercase leading-none tracking-tighter text-white">
                  Allico
                  <span className="block text-sm tracking-widest text-primary">Industries</span>
                </div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Allico Industries is the premier provider of heavy-duty towing, recovery,
              and cargo control equipment. Built tough for the toughest jobs on the planet.
            </p>
            <div className="flex space-x-4 text-gray-500">
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">social_leaderboard</span>
              </a>
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
              </a>
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">smart_display</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-6 border-l-4 border-primary pl-3 text-sm font-bold uppercase tracking-wide text-white">
              Shop Products
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link className="flex items-center transition hover:text-primary" href={getCategoryHref(category.slug)}>
                    <span className="material-symbols-outlined mr-2 text-xs">chevron_right</span>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 border-l-4 border-primary pl-3 text-sm font-bold uppercase tracking-wide text-white">
              Customer Support
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="transition hover:text-primary" href="#">
                  Order Status
                </a>
              </li>
              <li>
                <a className="transition hover:text-primary" href="#">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a className="transition hover:text-primary" href="#">
                  Returns and Warranty
                </a>
              </li>
              <li>
                <a className="transition hover:text-primary" href="#">
                  Become a Distributor
                </a>
              </li>
              <li>
                <a className="transition hover:text-primary" href="#">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 border-l-4 border-primary pl-3 text-sm font-bold uppercase tracking-wide text-white">
              Contact
            </h4>
            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex items-start">
                <span className="material-symbols-outlined mr-3 mt-1 text-primary">
                  location_on
                </span>
                <div>
                  4500 Industrial Pkwy
                  <br />
                  Cleveland, OH 44135
                </div>
              </div>
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">phone</span>
                <span className="text-lg font-bold text-white">(888) 555-0199</span>
              </div>
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">email</span>
                <span>sales@allicoind.com</span>
              </div>
            </div>
            <div className="mt-6 inline-block rounded border border-zinc-700 bg-black p-3">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-yellow-500">verified</span>
                <div className="text-xs font-bold leading-tight text-white">
                  CERTIFIED
                  <br />
                  <span className="text-primary">ISO 9001:2015</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 text-xs text-gray-600">
          <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
            <p className="text-[11px] leading-relaxed text-gray-600 sm:text-xs">
              (c) 2026 Allico Industries. All rights reserved. | Privacy Policy | Terms of Service
            </p>
            <p className="mt-1 text-[11px] leading-relaxed tracking-[0.08em] text-gray-500">
              Develop By Zihang Cheng
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { HomeFooter };





