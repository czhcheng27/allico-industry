import Link from "next/link";

import { getProductHref, type Product } from "@/lib/catalog";

type ProductListRowProps = {
  product: Product;
  href?: string;
};

function ProductListRow({ product, href }: ProductListRowProps) {
  const productHref = href || getProductHref(product);
  const topSpecs = product.listSpecs.slice(0, 2);

  return (
    <article className="group rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <Link
          aria-label={`View details for ${product.name}`}
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded border border-gray-200 bg-white p-2"
          href={productHref}
        >
          <img
            alt={product.name}
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            src={product.image}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wide text-gray-500">
              SKU {product.sku}
            </p>
            <span
              className={
                product.status === "In Stock"
                  ? "rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700"
                  : "rounded-full bg-yellow-50 px-2 py-0.5 text-[11px] font-semibold text-yellow-700"
              }
            >
              {product.status}
            </span>
          </div>

          <Link
            className="mt-1 block line-clamp-2 font-display text-lg font-bold leading-tight text-gray-900 transition-colors hover:text-primary"
            href={productHref}
          >
            {product.name}
          </Link>

          <div className="mt-2 flex flex-wrap gap-2">
            {topSpecs.map((spec) => (
              <span
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700"
                key={spec.label}
              >
                <span className="font-semibold">{spec.label}:</span> {spec.value}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-3 md:w-44 md:flex-col md:items-end md:justify-start md:border-t-0 md:pt-0">
          <div className="font-display text-2xl font-black text-gray-900">
            {product.price}
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-sm border border-gray-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-800 transition hover:border-black hover:bg-black hover:text-white"
            href={productHref}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export { ProductListRow };
