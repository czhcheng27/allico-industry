"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getProductHref, type Product } from "@/lib/catalog";

const FEATURED_PRODUCTS_VISIBLE_COUNT = 5;
const FEATURED_PRODUCTS_AUTOPLAY_MS = 6000;

type FeaturedProductsCarouselProps = {
  products: Product[];
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      className="group block cursor-pointer rounded-sm border border-transparent bg-white p-4 transition hover:border-gray-200 hover:shadow-lg"
      href={getProductHref(product)}
    >
      <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
        <img
          alt={product.name}
          className="max-h-32 object-contain mix-blend-multiply transition duration-500 group-hover:scale-110"
          src={product.image}
        />
        {product.badge ? (
          <div className="absolute right-2 top-2 rounded-sm bg-primary px-2 py-1 text-xs font-bold uppercase text-primary-foreground">
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
    </Link>
  );
}

function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const shouldCarousel = products.length > FEATURED_PRODUCTS_VISIBLE_COUNT;

  useEffect(() => {
    if (!shouldCarousel || !api) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      api.scrollNext();
    }, FEATURED_PRODUCTS_AUTOPLAY_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [api, shouldCarousel]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {shouldCarousel ? (
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            setApi={setApi}
          >
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
                <CarouselPrevious
                  className="static h-10 w-10 translate-x-0 translate-y-0 rounded-sm border-gray-300 bg-white text-gray-600 shadow-none hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  size="icon-lg"
                  variant="outline"
                />
                <CarouselNext
                  className="static h-10 w-10 translate-x-0 translate-y-0 rounded-sm border-gray-300 bg-white text-gray-600 shadow-none hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  size="icon-lg"
                  variant="outline"
                />
              </div>
            </div>
            <CarouselContent className="-ml-6">
              {products.map((product) => (
                <CarouselItem
                  key={product.slug}
                  className="basis-1/2 pl-6 md:basis-1/3 lg:basis-1/5"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <>
            <div className="mb-10 flex items-end justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="font-display text-3xl font-black uppercase tracking-tight text-gray-900">
                  Featured <span className="text-primary">Products</span>
                </h2>
                <p className="mt-2 text-gray-500">
                  Top-rated equipment for the toughest jobs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export { FeaturedProductsCarousel };
