import { notFound } from "next/navigation";

import { ProductDetailPage } from "@/components/catalog/product-detail-page";
import {
  fetchCategoryBySlug,
  fetchProductByCategoryAndSku,
  fetchRelatedProducts,
} from "@/lib/catalog-api";

type ProductRouteProps = {
  params: Promise<{
    category: string;
    sku: string;
  }>;
};

export default async function ProductRoutePage({ params }: ProductRouteProps) {
  const { category: categorySlug, sku } = await params;
  const decodedSku = decodeURIComponent(sku);
  const category = await fetchCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const product = await fetchProductByCategoryAndSku(category.slug, decodedSku);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product, 3);

  return (
    <ProductDetailPage category={category} product={product} relatedProducts={relatedProducts} />
  );
}
