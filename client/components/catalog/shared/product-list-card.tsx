import Link from "next/link";

import { getProductHref, type Product } from "@/lib/catalog";

type ProductListCardProps = {
  product: Product;
  href?: string;
};

function ProductListCard({ product, href }: ProductListCardProps) {
  const productHref = href || getProductHref(product);

  return (
    <div className="group relative flex flex-col border border-gray-200 bg-white transition-colors hover:border-primary">
      <Link
        aria-label={`View details for ${product.name}`}
        className="relative block aspect-[4/3] border-b border-gray-100 bg-white p-4"
        href={productHref}
      >
        {product.badge ? (
          <span className="absolute left-2 top-2 z-10 bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        ) : null}
        <img
          alt={product.name}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          src={product.image}
        />
      </Link>

      <div className="flex flex-grow flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <div className="rounded-sm bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">
            SKU: {product.sku}
          </div>
          <div
            className={
              product.status === "In Stock"
                ? "text-xs font-bold text-green-600"
                : "text-xs font-bold text-yellow-600"
            }
          >
            {product.status}
          </div>
        </div>

        <h3 className="mb-2 font-display text-base font-bold leading-tight text-gray-900">
          <Link className="transition-colors hover:text-primary" href={productHref}>
            {product.name}
          </Link>
        </h3>

        <div className="mb-4 space-y-1 border-y border-gray-100 py-2 text-xs text-gray-600">
          {product.listSpecs.map((spec) => (
            <div key={spec.label} className="flex justify-between">
              <span>{spec.label}:</span>
              <span className="font-medium">{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl font-black">{product.price}</span>
          <button className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-black hover:text-white">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export { ProductListCard };
