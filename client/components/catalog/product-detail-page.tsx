import Link from "next/link";

import { ProductGallery } from "@/components/catalog/shared/product-gallery";
import { SpecTable } from "@/components/catalog/shared/spec-table";
import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";
import {
  type Category,
  getCategoryHref,
  getProductGalleryImages,
  getProductHref,
  type Product,
} from "@/lib/catalog";

type ProductDetailPageProps = {
  category: Category;
  product: Product;
  relatedProducts: Product[];
  backHref?: string;
};

function ProductDetailPage({
  category,
  product,
  relatedProducts,
  backHref,
}: ProductDetailPageProps) {
  const detailContent = product.detail ?? {
    series: product.sku,
    headline: product.name,
    description:
      "This product is engineered for high-cycle industrial usage and heavy-duty transport environments.",
    features: [
      "Built for demanding field conditions",
      "Quality-tested for load reliability",
      "Designed for professional fleet operations",
    ],
    table: product.listSpecs,
    thumbImages: [product.image],
    relatedSlugs: [],
  };

  const galleryImages = getProductGalleryImages(product);

  return (
    <div className="bg-background-light text-text-light">
      <HomeHeader />

      <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-black">
        Free Shipping on Orders Over $500 | Certified Quality Assurance
      </div>

      <div className="border-b border-gray-200 bg-surface-light">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <nav className="flex min-w-0 items-center text-xs text-gray-500">
              <Link className="transition hover:text-primary" href="/">
                Home
              </Link>
              <span className="material-symbols-outlined mx-1 text-xs text-gray-400">chevron_right</span>
              <Link className="transition hover:text-primary" href={getCategoryHref(category.slug)}>
                {category.name}
              </Link>
              <span className="material-symbols-outlined mx-1 text-xs text-gray-400">chevron_right</span>
              <span className="truncate font-semibold text-gray-700">{detailContent.headline}</span>
            </nav>

            <Link
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-black hover:text-black"
              href={backHref || getCategoryHref(category.slug)}
            >
              <span className="material-symbols-outlined text-sm transition group-hover:-translate-x-0.5">
                west
              </span>
              Back to results
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <ProductGallery alt={product.name} images={galleryImages} />
          </div>

          <div className="flex h-full flex-col lg:col-span-7">
            <div className="mb-2 flex items-start justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">
                Series: {detailContent.series}
              </div>
              <span className="rounded border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-bold uppercase text-green-800">
                {product.status}
              </span>
            </div>

            <h1 className="mb-4 font-display text-3xl font-black uppercase leading-tight text-gray-900 lg:text-4xl">
              {detailContent.headline}
            </h1>

            <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6">
              <div className="flex items-center">
                <div className="flex text-primary">
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="material-symbols-outlined text-sm">star</span>
                </div>
                <span className="ml-2 cursor-pointer text-sm text-gray-500 underline decoration-dotted hover:text-primary">
                  Read 24 Reviews
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="material-symbols-outlined mr-1 text-base">verified</span>
                Certified Testing
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span className="material-symbols-outlined mr-1 text-base">local_shipping</span>
                Ships Today
              </div>
            </div>

            <div className="mb-8 grid gap-8 md:grid-cols-2">
              <div className="text-gray-600">
                <p>{detailContent.description}</p>
                <ul className="mt-4 space-y-2">
                  {detailContent.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <span className="material-symbols-outlined mr-2 mt-0.5 text-sm text-primary">
                        check_circle
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <SpecTable rows={detailContent.table} />
            </div>

            <div className="mt-auto rounded-lg border border-gray-200 bg-surface-light p-6">
              <div className="flex flex-col items-end gap-4 sm:flex-row sm:items-center">
                <div className="w-full sm:w-auto">
                  <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Length (Feet)
                  </label>
                  <div className="flex w-full items-center rounded border border-gray-300 bg-white sm:w-32">
                    <input
                      className="w-full border-none bg-transparent py-2.5 text-center text-base font-bold focus:ring-0"
                      defaultValue={10}
                      min={1}
                      type="number"
                    />
                    <span className="pr-3 text-sm font-medium text-gray-400">ft</span>
                  </div>
                </div>
                <button className="flex w-full flex-1 items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-center font-display text-lg font-bold uppercase tracking-wider text-black shadow-md transition hover:-translate-y-0.5 hover:bg-primary-hover">
                  <span className="material-symbols-outlined">request_quote</span>
                  Request A Quote
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-600">check</span>
                  Volume discounts available
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-600">check</span>
                  Custom cut lengths
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="lg:w-2/3">
              <h3 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold uppercase text-gray-900">
                <span className="block h-8 w-2 rounded-sm bg-primary" />
                Related Accessories
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.slug}
                    className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-lg"
                  >
                    <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded bg-gray-100 p-4">
                      <img
                        alt={relatedProduct.name}
                        className="h-32 object-contain mix-blend-multiply transition group-hover:scale-105"
                        src={relatedProduct.image}
                      />
                    </div>
                    <div className="mb-1 text-xs font-bold uppercase text-primary">
                      Compatible Hardware
                    </div>
                    <h4 className="mb-2 font-bold leading-tight text-gray-900 transition group-hover:text-primary">
                      {relatedProduct.name}
                    </h4>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {relatedProduct.listSpecs[0]?.label}: {relatedProduct.listSpecs[0]?.value}
                      </span>
                      <Link
                        className="text-sm font-bold text-primary hover:underline"
                        href={getProductHref(relatedProduct)}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="rounded-lg bg-zinc-900 p-8 text-white shadow-xl">
                <h4 className="mb-4 border-b border-zinc-700 pb-4 font-display text-2xl font-bold uppercase">
                  Safe Lifting Assurance
                </h4>
                <div className="mb-8 space-y-4 text-zinc-200">
                  <p className="text-sm leading-relaxed">
                    Allico Industries chains undergo rigorous testing to ensure maximum
                    safety on your job site.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">
                        verified_user
                      </span>
                      100% Proof Tested
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">
                        verified_user
                      </span>
                      4:1 Design Safety Factor
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">
                        verified_user
                      </span>
                      Full Traceability
                    </li>
                  </ul>
                </div>
                <a
                  className="block w-full rounded bg-primary py-3 text-center font-bold uppercase text-black shadow-lg transition hover:bg-yellow-400"
                  href="#"
                >
                  Download Spec Sheet (PDF)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />

      <a
        className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black shadow-xl transition hover:scale-110 hover:bg-primary-hover"
        href="#"
      >
        <span className="material-symbols-outlined">chat</span>
      </a>
    </div>
  );
}

export { ProductDetailPage };
