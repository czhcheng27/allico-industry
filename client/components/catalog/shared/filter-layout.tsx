"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { type Category } from "@/lib/catalog";
import { type CategoryProductFilters } from "@/lib/catalog-api";

type FilterLayoutProps = {
  activeCategory?: Category;
  totalProducts: number;
  selectedFilters: CategoryProductFilters;
  resetHref: string;
  preserveKeyword?: string;
  showCategoryInfo?: boolean;
  showSubcategory?: boolean;
  children: ReactNode;
};

type DraftFilterState = {
  subcategory: string;
  inStock: boolean;
  wllRange: "" | "3000-5000" | "5000-10000" | "10000+";
  priceSort: "" | "asc" | "desc";
};

const priceSortOptions: Array<{
  label: string;
  value: DraftFilterState["priceSort"];
}> = [
  { label: "Default", value: "" },
  { label: "Low to High", value: "asc" },
  { label: "High to Low", value: "desc" },
];

function toDraftState(
  selectedFilters: CategoryProductFilters,
): DraftFilterState {
  return {
    subcategory: selectedFilters.subcategory ?? "",
    inStock: Boolean(selectedFilters.inStock),
    wllRange: selectedFilters.wllRange ?? "",
    priceSort: selectedFilters.priceSort ?? "",
  };
}

function FilterLayout({
  activeCategory,
  totalProducts,
  selectedFilters,
  resetHref,
  preserveKeyword,
  showCategoryInfo = true,
  showSubcategory = true,
  children,
}: FilterLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DraftFilterState>(
    toDraftState(selectedFilters),
  );

  const category = activeCategory ?? null;
  const shouldShowCategoryInfo = Boolean(showCategoryInfo && category);
  const shouldShowSubcategory = Boolean(
    showSubcategory && category && category.subcategories.length > 0,
  );

  useEffect(() => {
    setDraftFilters(toDraftState(selectedFilters));
  }, [
    selectedFilters.inStock,
    selectedFilters.priceSort,
    selectedFilters.subcategory,
    selectedFilters.wllRange,
  ]);

  const navigateWithParams = useCallback(
    (update: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!showSubcategory) {
        params.delete("subcategory");
      }
      if (!showCategoryInfo) {
        params.delete("category");
      }
      params.delete("sort");

      update(params);
      params.delete("page");

      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router, searchParams, showCategoryInfo, showSubcategory],
  );

  const onSubcategoryChange = (value: string) => {
    setDraftFilters((prev) => ({ ...prev, subcategory: value }));
    navigateWithParams((params) => {
      if (value) {
        params.set("subcategory", value);
      } else {
        params.delete("subcategory");
      }
    });
  };

  const onInStockChange = (checked: boolean) => {
    setDraftFilters((prev) => ({ ...prev, inStock: checked }));
    navigateWithParams((params) => {
      if (checked) {
        params.set("inStock", "1");
      } else {
        params.delete("inStock");
      }
    });
  };

  const onWllRangeChange = (value: DraftFilterState["wllRange"]) => {
    setDraftFilters((prev) => ({ ...prev, wllRange: value }));
    navigateWithParams((params) => {
      if (value) {
        params.set("wllRange", value);
      } else {
        params.delete("wllRange");
      }
    });
  };

  const onPriceSortChange = (value: DraftFilterState["priceSort"]) => {
    setDraftFilters((prev) => ({ ...prev, priceSort: value }));
    navigateWithParams((params) => {
      if (value) {
        params.set("priceSort", value);
      } else {
        params.delete("priceSort");
      }
    });
  };

  const onReset = () => {
    setDraftFilters(toDraftState({}));
    startTransition(() => {
      router.replace(resetHref, { scroll: false });
    });
    setIsMobileOpen(false);
  };

  const renderFilterCard = () => (
    <form
      className="border border-gray-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      {preserveKeyword ? (
        <input name="keyword" type="hidden" defaultValue={preserveKeyword} />
      ) : null}

      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-gray-900">
        Refine Results
      </h3>
      <p className="mt-1 border-b border-gray-100 pb-3 text-xs text-gray-500">
        {totalProducts} product{totalProducts === 1 ? "" : "s"} matched
      </p>

      {shouldShowCategoryInfo && category ? (
        <div className="my-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-800">
            <span className="material-symbols-outlined text-base text-primary">
              category
            </span>
            {category.name}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {shouldShowSubcategory && category ? (
          <div>
            <h4 className="mb-2 mt-1 text-xs font-bold uppercase text-gray-900">
              Subcategory
            </h4>
            <select
              className="form-select w-full rounded-sm border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:ring-black"
              value={draftFilters.subcategory}
              onChange={(event) => onSubcategoryChange(event.target.value)}
            >
              <option value="">All</option>
              {category.subcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">
            Availability
          </h4>
          <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
            <input
              className="form-checkbox rounded-sm border-gray-300 text-black focus:ring-black"
              checked={draftFilters.inStock}
              onChange={(event) => onInStockChange(event.target.checked)}
              type="checkbox"
            />
            <span className="text-sm text-gray-600">
              In Stock ({totalProducts})
            </span>
          </label>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">
            Working Load Limit
          </h4>
          <div className="space-y-1">
            <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
              <input
                className="form-radio border-gray-300 text-black focus:ring-black"
                checked={draftFilters.wllRange === "3000-5000"}
                onChange={() => onWllRangeChange("3000-5000")}
                type="radio"
              />
              <span className="text-sm text-gray-600">3,000 - 5,000 lbs</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
              <input
                className="form-radio border-gray-300 text-black focus:ring-black"
                checked={draftFilters.wllRange === "5000-10000"}
                onChange={() => onWllRangeChange("5000-10000")}
                type="radio"
              />
              <span className="text-sm text-gray-600">5,000 - 10,000 lbs</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
              <input
                className="form-radio border-gray-300 text-black focus:ring-black"
                checked={draftFilters.wllRange === "10000+"}
                onChange={() => onWllRangeChange("10000+")}
                type="radio"
              />
              <span className="text-sm text-gray-600">10,000+ lbs</span>
            </label>
            <label className="flex cursor-pointer items-center space-x-2 rounded p-1 hover:bg-gray-50">
              <input
                className="form-radio border-gray-300 text-black focus:ring-black"
                checked={draftFilters.wllRange === ""}
                onChange={() => onWllRangeChange("")}
                type="radio"
              />
              <span className="text-sm text-gray-600">Any</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-bold uppercase text-gray-900">
            Price Order
          </h4>
          <div className="grid grid-cols-1 gap-1.5">
            {priceSortOptions.map((option) => {
              const isDefault = option.value === "";
              const isActive = isDefault
                ? !draftFilters.priceSort
                : draftFilters.priceSort === option.value;

              return (
                <button
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "flex w-full items-center justify-between rounded-sm border border-black bg-black px-3 py-2 text-left text-sm font-semibold text-white"
                      : "flex w-full items-center justify-between rounded-sm border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:border-black hover:text-black"
                  }
                  key={option.label}
                  onClick={() => onPriceSortChange(option.value)}
                  type="button"
                >
                  <span>{option.label}</span>
                  <span
                    className={
                      isActive
                        ? "material-symbols-outlined text-base text-white"
                        : "material-symbols-outlined text-base text-gray-400"
                    }
                  >
                    {isActive ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-full rounded-sm border border-gray-300 bg-white py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-700 transition hover:border-black hover:text-black"
            onClick={onReset}
            type="button"
          >
            Reset
          </button>
          {isPending ? (
            <span className="shrink-0 text-xs font-medium text-gray-500">
              Updating...
            </span>
          ) : null}
        </div>
      </div>
    </form>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-sm border border-gray-200 bg-white px-3 py-2 lg:hidden">
        <button
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
          onClick={() => setIsMobileOpen(true)}
          type="button"
        >
          <span className="material-symbols-outlined text-base">tune</span>
          Filters
        </button>
        <span className="text-xs font-medium text-gray-500">
          {totalProducts} result{totalProducts === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-72">
          <div>{renderFilterCard()}</div>
        </aside>

        <div className="relative min-w-0 flex-1">
          {isPending ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-sm bg-white/70">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                Loading products...
              </div>
            </div>
          ) : null}

          <div
            className={
              isPending ? "opacity-60 transition-opacity" : "transition-opacity"
            }
          >
            {children}
          </div>
        </div>
      </div>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileOpen(false)}
            type="button"
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-gray-900">
                Filters
              </h3>
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600"
                onClick={() => setIsMobileOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  close
                </span>
              </button>
            </div>
            {renderFilterCard()}
            <div className="mt-3">
              <Link
                className="block rounded-sm bg-black py-2 text-center text-xs font-bold uppercase tracking-wide text-white"
                href={resetHref}
                onClick={() => setIsMobileOpen(false)}
              >
                Close
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export { FilterLayout };
