import Link from "next/link";

import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";

async function AboutPage() {
  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <HomeHeader activePage="about" />

      <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-black">
        Supporting fleets, distributors, and industrial buyers across Canada and
        the United States
      </div>

      <main>
        <section className="border-b border-gray-200 bg-white py-6 md:py-7">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl border-l-4 border-primary pl-4 md:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                About Us
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-black uppercase leading-tight text-gray-900 md:text-4xl">
                Allico Industries
              </h1>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-18">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              <div className="space-y-7 text-base leading-8 text-gray-700">
                <p>
                  Allico industries supplies cargo control, towing products and
                  related accessories to a wide range of companies across Canada
                  and the United States.
                </p>
                <p>
                  We understand that our customers need more than just
                  acceptable products, they need exceptionally high-quality
                  products that are going to last for years to come and offer
                  them at reasonable prices. Our extensive relationship with
                  manufacturers and business models allows us to provide
                  products at unbeatable prices in the industry. We work with
                  only the best manufacturers to ensure that every product we
                  sell is made from quality materials and designed by experts in
                  their field.
                </p>
                <p>
                  With Allico Industries, you can rest assured you know the
                  products and service you choose will be of the highest quality
                  available.
                </p>
                <p>
                  Our team has years of experience in the industry, which allows
                  us to provide a level of service that truly sets us apart from
                  our competitors. We know how important it is for you to have
                  someone on your side who understands your needs, so we&apos;ll
                  go above and beyond to ensure that your satisfaction is our
                  top priority.
                </p>
                <p>
                  Our mission is to help you improve the quality of your product
                  line. Keep your equipment running and increase your
                  profitability. Your satisfaction is our top priority.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-8 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-yellow-400"
                  href="/products"
                >
                  Browse Catalog
                </Link>
                {/* <Link
                  className="inline-flex items-center justify-center border border-zinc-900 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
                  href="tel:8885550199"
                >
                  Contact Us
                </Link> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export { AboutPage };
