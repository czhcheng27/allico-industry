import Link from "next/link";

import { getCategoryHref } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";

async function HomeFooter() {
  const categories = await fetchCategories();

  return (
    <footer className="border-t border-white/10 bg-brand-ink pb-8 pt-16 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6 flex items-center space-x-2">
              <div className="flex flex-col">
                <div className="font-display text-2xl font-black uppercase leading-none tracking-tighter text-white">
                  Allico
                  <span className="block text-sm tracking-widest text-primary">
                    Industries
                  </span>
                </div>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-white/65">
              Allico Industries providing quality towing, recovery, and cargo
              control equipment at reasonable prices.
            </p>
            {/* <div className="flex space-x-4 text-white/45">
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">
                  social_leaderboard
                </span>
              </a>
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">
                  photo_camera
                </span>
              </a>
              <a className="transition hover:text-primary" href="#">
                <span className="material-symbols-outlined text-2xl">
                  smart_display
                </span>
              </a>
            </div> */}
          </div>

          <div>
            <h4 className="mb-6 border-l-4 border-primary pl-3 text-sm font-bold uppercase tracking-wide text-white">
              Shop Products
            </h4>
            <ul className="space-y-3 text-sm text-white/65">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    className="flex items-center transition hover:text-primary"
                    href={getCategoryHref(category.slug)}
                  >
                    <span className="material-symbols-outlined mr-2 text-xs">
                      chevron_right
                    </span>
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
            <ul className="space-y-3 text-sm text-white/65">
              {/* <li>
                <a className="transition hover:text-primary" href="#">
                  Order Status
                </a>
              </li> */}
              <li>
                <Link
                  className="transition hover:text-primary"
                  href="/returns-and-warranty"
                >
                  Returns and Warranty
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-primary" href="/contact">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 border-l-4 border-primary pl-3 text-sm font-bold uppercase tracking-wide text-white">
              Contact
            </h4>
            <div className="space-y-4 text-sm text-white/65">
              <div className="flex items-start">
                <span className="material-symbols-outlined mr-3 mt-1 text-primary">
                  location_on
                </span>
                <div>
                  Warehouse: 12353 104 Ave
                  <br />
                  Surrey BC V3V 3H2
                </div>
              </div>
              <div className="flex items-start">
                <span className="material-symbols-outlined mr-3 mt-1 text-primary">
                  apartment
                </span>
                <div>
                  Office: 7575 Alderbridge Way
                  <br />
                  Richmond BC V6X 4L1
                </div>
              </div>
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">
                  email
                </span>
                <span>bruce@allicoindustries.ca</span>
              </div>
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-3 text-primary">
                  phone
                </span>
                <span className="text-lg font-bold text-white">
                  604-781-8659
                </span>
              </div>
            </div>
            {/* <div className="mt-6 inline-block rounded border border-white/12 bg-white/6 p-3">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-primary">
                  verified
                </span>
                <div className="text-xs font-bold leading-tight text-white">
                  CERTIFIED
                  <br />
                  <span className="text-primary">ISO 9001:2015</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-xs text-white/40">
          <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
            <p className="text-[11px] leading-relaxed text-white/40 sm:text-xs">
              (c) 2026 Allico Industries. All rights reserved. | Privacy Policy
              | Terms of Service
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { HomeFooter };
