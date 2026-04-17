import { type CatalogFilterDefinition, type Product } from "@/lib/catalog";

export type CatalogFilterSelections = {
  subcategory?: string;
  chainSize?: string;
  chainLengthFt?: string;
  strapWidthIn?: string;
  strapLengthBucket?: string;
  hookSize?: string;
  hookLengthIn?: string;
};

export const ADVANCED_FILTER_KEYS = [
  "chainSize",
  "chainLengthFt",
  "strapWidthIn",
  "strapLengthBucket",
  "hookSize",
  "hookLengthIn",
] as const;

export type AdvancedFilterKey = (typeof ADVANCED_FILTER_KEYS)[number];

function normalizeValue(value: unknown) {
  return String(value ?? "").trim();
}

function getProductFilterValue(product: Product, key: AdvancedFilterKey) {
  const attributes = product.filterAttributes || {};

  if (key === "chainSize") {
    return normalizeValue(attributes.chainSizeCode);
  }

  if (key === "chainLengthFt") {
    return normalizeValue(attributes.chainLengthFt);
  }

  if (key === "strapWidthIn") {
    return normalizeValue(attributes.strapWidthIn);
  }

  if (key === "strapLengthBucket") {
    return normalizeValue(attributes.strapLengthBucket);
  }

  if (key === "hookSize") {
    return normalizeValue(attributes.hookSizeCode);
  }

  return normalizeValue(attributes.hookLengthIn);
}

function matchesAdvancedFilter(
  product: Product,
  key: AdvancedFilterKey,
  expectedValue: string | undefined,
) {
  const normalizedExpectedValue = normalizeValue(expectedValue);
  if (!normalizedExpectedValue) {
    return true;
  }

  const actualValue = getProductFilterValue(product, key);
  return Boolean(actualValue) && actualValue === normalizedExpectedValue;
}

export function applyCategoryProductFilters(
  source: Product[],
  filters: CatalogFilterSelections,
) {
  return source.filter((product) => {
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }

    return ADVANCED_FILTER_KEYS.every((key) =>
      matchesAdvancedFilter(product, key, filters[key]),
    );
  });
}

export function getFacetProductsForFilter(
  source: Product[],
  filters: CatalogFilterSelections,
  keyToSkip: AdvancedFilterKey,
) {
  return source.filter((product) => {
    if (filters.subcategory && product.subcategory !== filters.subcategory) {
      return false;
    }

    return ADVANCED_FILTER_KEYS.every((key) => {
      if (key === keyToSkip) {
        return true;
      }

      return matchesAdvancedFilter(product, key, filters[key]);
    });
  });
}

export function getAvailableFilterOptions(
  source: Product[],
  filters: CatalogFilterSelections,
  definition: CatalogFilterDefinition,
) {
  const facetProducts = getFacetProductsForFilter(
    source,
    filters,
    definition.key as AdvancedFilterKey,
  );
  const valueSet = new Set(
    facetProducts
      .map((product) => getProductFilterValue(product, definition.key as AdvancedFilterKey))
      .filter(Boolean),
  );
  const selectedValue = normalizeValue(filters[definition.key as AdvancedFilterKey]);

  return definition.options.filter((option) => {
    const optionValue = normalizeValue(option.value);
    return valueSet.has(optionValue) || optionValue === selectedValue;
  });
}
