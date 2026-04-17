import { notFound } from "next/navigation";

import { ProductDetailPage } from "@/components/catalog/product-detail-page";
import { getCategoryHref } from "@/lib/catalog";
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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSingleValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

function buildBackHref(
  categorySlug: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const keyword = toSingleValue(searchParams.keyword)?.trim();
  const subcategory = toSingleValue(searchParams.subcategory)?.trim();
  const inStock = toSingleValue(searchParams.inStock);
  const view = toSingleValue(searchParams.view);
  const pageRaw = toSingleValue(searchParams.page);
  const page = Number.parseInt(String(pageRaw || ""), 10);

  if (keyword) {
    params.set("keyword", keyword);
  }
  if (subcategory) {
    params.set("subcategory", subcategory);
  }
  if (inStock === "1") {
    params.set("inStock", "1");
  }
  ["chainSize", "chainLengthFt", "strapWidthIn", "strapLengthBucket", "hookSize"]
    .map((key) => [key, toSingleValue(searchParams[key])?.trim()] as const)
    .forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
  if (view === "list") {
    params.set("view", "list");
  }
  if (Number.isFinite(page) && page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  const base = getCategoryHref(categorySlug);
  return query ? `${base}?${query}` : base;
}

export default async function ProductRoutePage({
  params,
  searchParams,
}: ProductRouteProps) {
  const { category: categorySlug, sku } = await params;
  const parsedSearchParams = await searchParams;
  const normalizedCategorySlug = String(categorySlug || "").trim();
  const normalizedSku = decodeURIComponent(String(sku || "")).trim();
  const category = await fetchCategoryBySlug(normalizedCategorySlug);

  if (!category) {
    notFound();
  }

  const product = await fetchProductByCategoryAndSku(category.slug, normalizedSku);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product, 3);
  const backHref = buildBackHref(category.slug, parsedSearchParams);

  return (
    <ProductDetailPage
      category={category}
      product={product}
      relatedProducts={relatedProducts}
      backHref={backHref}
    />
  );
}
