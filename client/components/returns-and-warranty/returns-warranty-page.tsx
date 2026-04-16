import Link from "next/link";

import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";

async function ReturnsWarrantyPage() {
  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <HomeHeader />

      <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground">
        Returns, warranty support, and after-sales assistance for Allico Industries customers
      </div>

      <main>
        <section className="border-b border-gray-200 bg-white py-6 md:py-7">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl border-l-4 border-primary pl-4 md:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Customer Support
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-black uppercase leading-tight text-gray-900 md:text-4xl">
                Returns and Warranty
              </h1>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-18">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              <div className="space-y-7 text-base leading-8 text-gray-700">
                <p>
                  We want you to feel confident when ordering from Allico
                  Industries. If you receive a product that does not meet your
                  expectations, please contact our team and we will review the
                  issue with you as quickly as possible.
                </p>
                <p>
                  Returns are typically reviewed based on product condition,
                  order details, and the reason for the return. To help us
                  process requests efficiently, please include your name,
                  company information, order reference, and a short description
                  of the issue when you contact us.
                </p>
                <p>
                  Warranty support may vary depending on the product category
                  and manufacturer. If you believe an item has a defect or a
                  performance issue under normal intended use, our team will
                  work with you to gather the necessary details and coordinate
                  the next steps.
                </p>
                <p>
                  For the fastest support, we recommend reaching out before
                  sending items back. This helps us confirm the correct return
                  or warranty process and make sure your request is handled as
                  smoothly as possible.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-8 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition hover:bg-primary-hover"
                  href="/contact"
                >
                  Contact Support
                </Link>
                <Link
                  className="inline-flex items-center justify-center border border-brand-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition hover:bg-brand-ink hover:text-white"
                  href="/products"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export { ReturnsWarrantyPage };
