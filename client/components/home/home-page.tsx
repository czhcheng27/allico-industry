import Link from "next/link";

import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";
import { type Product, getCategoryHref, getProductHref, siteMedia } from "@/lib/catalog";
import { fetchCategories } from "@/lib/catalog-api";

type HomePageProps = {
  featuredProducts: Product[];
};

async function HomePage({ featuredProducts }: HomePageProps) {
  const categories = await fetchCategories();

  return (
    <>
      <div id="top" className="bg-background-light text-text-light">
        <HomeHeader />

        <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-black">
          Free Shipping on Orders Over $500 | Certified Quality Assurance
        </div>

        <section className="relative h-[550px] w-full overflow-hidden bg-black md:h-[650px]">
          <img
            alt="Heavy Duty Towing Equipment Background"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            src={siteMedia.heroImage}
          />
          <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-l from-transparent via-black/20 to-black/80" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl pt-12">
                <div className="border-l-8 border-primary py-2 pl-6 md:pl-10">
                  <h1 className="mb-4 font-display text-5xl font-black uppercase leading-[0.9] text-white drop-shadow-xl md:text-7xl">
                    Allico Industries:
                    <br />
                    <span className="text-primary">Heavy-Duty</span> Towing and Cargo Solutions
                  </h1>
                  <p className="text-shadow mb-8 max-w-xl text-lg font-light text-gray-200 md:text-2xl">
                    Engineered for extreme durability. The trusted choice for
                    professional haulers and industrial operators.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                      className="inline-flex transform items-center justify-center bg-primary px-10 py-4 font-display text-lg font-bold uppercase tracking-wider text-black transition hover:-translate-y-1 hover:bg-yellow-400"
                      href={getCategoryHref("towing")}
                    >
                      Shop Catalog
                      <span className="material-symbols-outlined ml-2 text-xl">
                        arrow_forward
                      </span>
                    </Link>
                    <Link
                      className="inline-flex transform items-center justify-center border-2 border-white px-10 py-4 font-display text-lg font-bold uppercase tracking-wider text-white transition hover:-translate-y-1 hover:bg-white hover:text-black"
                      href={getCategoryHref("industrial-chains")}
                    >
                      Custom Orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-b border-zinc-700 bg-zinc-800 py-4 text-xs text-gray-400 shadow-inner md:text-sm">
          <div className="container mx-auto flex items-center justify-between px-4">
            <div className="hidden md:block">ISO 9001:2015 Certified Manufacturer</div>
            <div className="flex space-x-6 text-xs font-bold uppercase tracking-wider text-gray-500">
              <span className="flex items-center">
                <span className="material-symbols-outlined mr-1 text-base text-primary">
                  verified
                </span>
                Quality Tested
              </span>
              <span className="flex items-center">
                <span className="material-symbols-outlined mr-1 text-base text-primary">
                  local_shipping
                </span>
                Fast Fulfillment
              </span>
              <span className="flex items-center">
                <span className="material-symbols-outlined mr-1 text-base text-primary">
                  support_agent
                </span>
                24/7 Support
              </span>
            </div>
          </div>
        </div>

        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-2 font-display text-3xl font-black uppercase text-gray-900 md:text-4xl">
                Explore Our Categories
              </h2>
              <div className="mx-auto h-1 w-24 bg-primary" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={category.slug}
                  className={
                    index === 0
                      ? "group relative h-[450px] cursor-pointer overflow-hidden border-b-4 border-primary bg-zinc-800"
                      : "group relative h-[450px] cursor-pointer overflow-hidden border-b-4 border-zinc-700 bg-zinc-800 transition-colors duration-300 hover:border-primary"
                  }
                  href={getCategoryHref(category.slug)}
                >
                  <img
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-110 group-hover:opacity-50"
                    src={category.cardImage}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <div className="mb-2 flex items-center">
                      <span className="material-symbols-outlined mr-2 text-3xl text-primary">
                        {category.icon}
                      </span>
                      <h3 className="font-display text-3xl font-bold uppercase text-white">
                        {category.name}
                      </h3>
                    </div>

                    {category.subcategories.length > 0 ? (
                      <ul className="mb-4 space-y-2 border-l-2 border-zinc-600 pl-1 text-sm text-gray-300 transition-all group-hover:border-primary">
                        {category.subcategories.map((subcategory) => (
                          <li key={subcategory.slug} className="transition hover:text-white">
                            {`> ${subcategory.name}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-4 text-sm leading-snug text-gray-400">
                        Premium grade hooks, shackles, and connection hardware.
                      </p>
                    )}

                    <span className="flex items-center text-xs font-bold uppercase tracking-widest text-primary">
                      View All
                      <span className="material-symbols-outlined ml-1 text-sm">
                        chevron_right
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-zinc-100 py-16">
          <div className="container mx-auto px-4">
            <div className="overflow-hidden rounded-sm bg-white shadow-2xl">
              <div className="flex flex-col md:flex-row">
                <div className="relative p-10 md:w-1/2 md:p-16">
                  <div className="absolute left-0 top-0 h-full w-2 bg-primary" />
                  <div className="mb-6 flex items-center space-x-2 text-primary">
                    <span className="material-symbols-outlined text-4xl">verified_user</span>
                    <span className="font-display text-xl font-black uppercase tracking-widest">
                      Certified Safety
                    </span>
                  </div>
                  <h2 className="mb-6 font-display text-3xl font-black uppercase leading-none text-gray-900 md:text-5xl">
                    Trust in Every <br />
                    <span className="text-primary">Link and Stitch</span>
                  </h2>
                  <p className="mb-8 leading-relaxed text-gray-600">
                    At Allico Industries, safety is not just a feature. Every chain,
                    strap, and hook undergoes rigorous load testing to meet or exceed
                    NACM, WSTDA, and DOT standards.
                  </p>
                  <ul className="mb-8 grid grid-cols-2 gap-4">
                    <li className="flex items-center text-sm font-bold text-gray-800">
                      <span className="material-symbols-outlined mr-2 text-green-500">
                        check_circle
                      </span>
                      DOT Compliant
                    </li>
                    <li className="flex items-center text-sm font-bold text-gray-800">
                      <span className="material-symbols-outlined mr-2 text-green-500">
                        check_circle
                      </span>
                      WSTDA Standards
                    </li>
                    <li className="flex items-center text-sm font-bold text-gray-800">
                      <span className="material-symbols-outlined mr-2 text-green-500">
                        check_circle
                      </span>
                      Grade 70/80/100
                    </li>
                    <li className="flex items-center text-sm font-bold text-gray-800">
                      <span className="material-symbols-outlined mr-2 text-green-500">
                        check_circle
                      </span>
                      3x Safety Factor
                    </li>
                  </ul>
                  <a
                    className="border-b-2 border-primary pb-1 text-sm font-bold uppercase tracking-wider text-primary transition hover:text-black"
                    href="#"
                  >
                    Read Our Safety Protocols
                  </a>
                </div>

                <div className="relative h-80 min-h-[500px] bg-zinc-800 md:h-auto md:w-1/2">
                  <img
                    alt="Safety Testing Lab"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
                    src={siteMedia.safetyImage}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-black/50 backdrop-blur-sm">
                      <span className="font-display text-3xl font-black text-white">100%</span>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold uppercase text-white">
                      Quality Guarantee
                    </h3>
                    <p className="max-w-sm text-gray-300">
                      We stand behind every product we sell. If it fails under normal
                      use, we replace it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex items-end justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900">
                  Featured <span className="text-primary">Products</span>
                </h2>
                <p className="mt-2 text-gray-500">
                  Top-rated equipment for the toughest jobs.
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-300 bg-white text-gray-600 transition hover:border-primary hover:bg-primary hover:text-black">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-300 bg-white text-gray-600 transition hover:border-primary hover:bg-primary hover:text-black">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {featuredProducts.map((product) => (
                <Link
                  key={product.slug}
                  className="group cursor-pointer rounded-sm border border-transparent bg-white p-4 transition hover:border-gray-200 hover:shadow-lg"
                  href={getProductHref(product)}
                >
                  <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
                    <img
                      alt={product.name}
                      className="max-h-32 object-contain mix-blend-multiply transition duration-500 group-hover:scale-110"
                      src={product.image}
                    />
                    {product.badge ? (
                      <div className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase text-black">
                        {product.badge}
                      </div>
                    ) : null}
                  </div>
                  <h4 className="mb-1 text-base font-bold uppercase leading-tight text-gray-900 transition group-hover:text-primary">
                    {product.name}
                  </h4>
                  <p className="mb-3 text-xs text-gray-500">
                    {product.listSpecs.map((spec) => spec.value).join(" | ")}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-gray-900">
                      {product.price}
                    </span>
                    <button className="text-primary hover:text-yellow-400">
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-yellow-500 bg-primary py-8">
          <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
            <div className="mb-6 md:mb-0">
              <h3 className="font-display text-2xl font-black uppercase leading-none text-black">
                Join the Allico Network
              </h3>
              <p className="mt-1 text-sm font-medium text-black/80">
                Get exclusive deals on heavy duty equipment and safety tips.
              </p>
            </div>
            <form className="flex w-full shadow-xl md:w-auto">
              <input
                className="flex-grow bg-white px-4 py-3 text-black placeholder-gray-500 focus:ring-2 focus:ring-black md:w-80"
                placeholder="Enter your email address"
                type="email"
              />
              <button className="bg-black px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-zinc-800">
                Subscribe
              </button>
            </form>
          </div>
        </section>

        <HomeFooter />
      </div>
    </>
  );
}

export { HomePage };
