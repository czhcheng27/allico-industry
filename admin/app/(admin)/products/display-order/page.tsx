"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Modal, Skeleton, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getCategoryListApi,
  getProductDisplayOrderApi,
  saveProductDisplayOrderApi,
  type CategoryRecord,
} from "@/lib/api";
import { hasRouteAction } from "@/lib/permission";
import { useAuthStore } from "@/store/auth-store";
import type { Product } from "@/types/product";

const { Title, Paragraph, Text } = Typography;

const HOT_CONTAINER_ID = "hotSellerProducts";
const REGULAR_CONTAINER_ID = "regularProducts";

type ArrangementState = {
  hotSellerProducts: Product[];
  regularProducts: Product[];
};

function ProductCardContent({
  product,
  dragging = false,
  ghost = false,
}: {
  product: Product;
  dragging?: boolean;
  ghost?: boolean;
}) {
  return (
    <div
      className={
        dragging
          ? "rounded-xl border border-slate-300 bg-white p-3 shadow-2xl ring-2 ring-slate-900/10"
          : ghost
            ? "rounded-xl border border-dashed border-slate-300 bg-slate-100/80 p-3 opacity-35 shadow-sm"
          : "rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
      }
    >
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
          <img alt={product.name} className="h-full w-full object-contain" src={product.image} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <Tooltip title={product.name}>
                <div className="block w-full truncate text-sm font-semibold text-slate-900">
                  {product.name}
                </div>
              </Tooltip>
              <div className="mt-1 text-xs text-slate-500">SKU: {product.sku}</div>
            </div>
            <MenuOutlined className="mt-1 text-slate-400" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.subcategory ? <Tag>{product.subcategory}</Tag> : null}
            {product.isHotSeller ? <Tag color="red">HOT SELLER</Tag> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function cloneArrangement(state: ArrangementState | null): ArrangementState | null {
  if (!state) {
    return null;
  }

  return {
    hotSellerProducts: [...state.hotSellerProducts],
    regularProducts: [...state.regularProducts],
  };
}

function serializeArrangement(state: ArrangementState | null) {
  if (!state) {
    return "";
  }

  return JSON.stringify({
    hotSellerProductIds: state.hotSellerProducts.map((item) => item.id),
    regularProductIds: state.regularProducts.map((item) => item.id),
  });
}

function normalizeArrangement(state: ArrangementState): ArrangementState {
  return {
    hotSellerProducts: state.hotSellerProducts.map((item) => ({
      ...item,
      isHotSeller: true,
    })),
    regularProducts: state.regularProducts.map((item) => ({
      ...item,
      isHotSeller: false,
    })),
  };
}

function findContainer(id: string, state: ArrangementState | null) {
  if (!state) {
    return null;
  }

  if (id === HOT_CONTAINER_ID || state.hotSellerProducts.some((item) => item.id === id)) {
    return HOT_CONTAINER_ID;
  }

  if (
    id === REGULAR_CONTAINER_ID ||
    state.regularProducts.some((item) => item.id === id)
  ) {
    return REGULAR_CONTAINER_ID;
  }

  return null;
}

function moveProduct(state: ArrangementState, activeId: string, overId: string) {
  const sourceContainer = findContainer(activeId, state);
  const targetContainer = findContainer(overId, state);

  if (!sourceContainer || !targetContainer) {
    return state;
  }

  const sourceItems = [...state[sourceContainer]];
  const sourceIndex = sourceItems.findIndex((item) => item.id === activeId);
  const activeProduct = sourceItems[sourceIndex];

  if (!activeProduct) {
    return state;
  }

  if (sourceContainer === targetContainer) {
    const targetItems = [...state[targetContainer]];
    const targetIndex =
      overId === targetContainer
        ? targetItems.length - 1
        : targetItems.findIndex((item) => item.id === overId);

    if (targetIndex < 0 || sourceIndex === targetIndex) {
      return state;
    }

    return {
      ...state,
      [sourceContainer]: arrayMove(targetItems, sourceIndex, targetIndex).map((item) => ({
        ...item,
        isHotSeller: sourceContainer === HOT_CONTAINER_ID,
      })),
    };
  }

  const targetItems = [...state[targetContainer]];
  sourceItems.splice(sourceIndex, 1);
  const insertIndex =
    overId === targetContainer
      ? targetItems.length
      : targetItems.findIndex((item) => item.id === overId);

  targetItems.splice(
    insertIndex < 0 ? targetItems.length : insertIndex,
    0,
    {
      ...activeProduct,
      isHotSeller: targetContainer === HOT_CONTAINER_ID,
    },
  );

  return {
    ...state,
    [sourceContainer]: sourceItems.map((item) => ({
      ...item,
      isHotSeller: sourceContainer === HOT_CONTAINER_ID,
    })),
    [targetContainer]: targetItems.map((item) => ({
      ...item,
      isHotSeller: targetContainer === HOT_CONTAINER_ID,
    })),
  };
}

function previewMoveProduct(
  state: ArrangementState,
  event: DragOverEvent | DragEndEvent,
) {
  const activeId = String(event.active.id || "");
  const overId = String(event.over?.id || "");

  if (!activeId || !overId || activeId === overId) {
    return state;
  }

  const sourceContainer = findContainer(activeId, state);
  const targetContainer = findContainer(overId, state);

  if (!sourceContainer || !targetContainer) {
    return state;
  }

  const sourceItems = [...state[sourceContainer]];
  const sourceIndex = sourceItems.findIndex((item) => item.id === activeId);
  const activeProduct = sourceItems[sourceIndex];

  if (!activeProduct) {
    return state;
  }

  if (sourceContainer === targetContainer) {
    const targetItems = [...state[targetContainer]];
    const overIndex = targetItems.findIndex((item) => item.id === overId);

    if (overIndex < 0 || sourceIndex === overIndex) {
      return state;
    }

    return {
      ...state,
      [sourceContainer]: arrayMove(targetItems, sourceIndex, overIndex).map((item) => ({
        ...item,
        isHotSeller: sourceContainer === HOT_CONTAINER_ID,
      })),
    };
  }

  const targetItems = [...state[targetContainer]];
  const overIndex = targetItems.findIndex((item) => item.id === overId);
  const isBelowOverItem =
    event.over &&
    event.active.rect.current.translated &&
    event.active.rect.current.translated.top > event.over.rect.top + event.over.rect.height / 2;
  const insertIndex =
    overId === targetContainer
      ? targetItems.length
      : overIndex >= 0
        ? overIndex + (isBelowOverItem ? 1 : 0)
        : targetItems.length;

  sourceItems.splice(sourceIndex, 1);
  targetItems.splice(insertIndex, 0, {
    ...activeProduct,
    isHotSeller: targetContainer === HOT_CONTAINER_ID,
  });

  return {
    ...state,
    [sourceContainer]: sourceItems.map((item) => ({
      ...item,
      isHotSeller: sourceContainer === HOT_CONTAINER_ID,
    })),
    [targetContainer]: targetItems.map((item) => ({
      ...item,
      isHotSeller: targetContainer === HOT_CONTAINER_ID,
    })),
  };
}

function SortableProductCard({ product }: { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-75" : undefined}
    >
      <div {...attributes} {...listeners}>
        <ProductCardContent product={product} ghost={isDragging} />
      </div>
    </div>
  );
}

function DroppableColumn({
  containerId,
  title,
  products,
}: {
  containerId: typeof HOT_CONTAINER_ID | typeof REGULAR_CONTAINER_ID;
  title: string;
  products: Product[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: containerId });

  return (
    <section className="flex min-h-[280px] flex-1 flex-col xl:min-h-0">
      <div className="mb-3 flex items-center justify-between">
        <Text strong>{title}</Text>
        <Tag>{products.length}</Tag>
      </div>
      <div
        ref={setNodeRef}
        style={{ maxHeight: "calc(100vh - 300px)" }}
        className={
          isOver
            ? "flex min-h-[280px] flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto rounded-2xl border-2 border-slate-900 bg-slate-50 p-4 pr-3 xl:min-h-0"
            : "flex min-h-[280px] flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 pr-3 xl:min-h-0"
        }
      >
        <SortableContext
          items={products.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {products.length > 0 ? (
            products.map((product) => <SortableProductCard key={product.id} product={product} />)
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70">
              <Empty description="Drop products here" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </SortableContext>
      </div>
    </section>
  );
}

export default function ProductDisplayOrderPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = hasRouteAction(permissions, "/products/display-order", "write");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dragStartArrangementRef = useRef<ArrangementState | null>(null);

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [arrangement, setArrangement] = useState<ArrangementState | null>(null);
  const [initialArrangement, setInitialArrangement] = useState<ArrangementState | null>(null);
  const [activeProductId, setActiveProductId] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArrangement, setLoadingArrangement] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => serializeArrangement(arrangement) !== serializeArrangement(initialArrangement),
    [arrangement, initialArrangement],
  );
  const activeProduct = useMemo(() => {
    if (!arrangement || !activeProductId) {
      return null;
    }

    return (
      arrangement.hotSellerProducts.find((item) => item.id === activeProductId) ||
      arrangement.regularProducts.find((item) => item.id === activeProductId) ||
      null
    );
  }, [activeProductId, arrangement]);

  useEffect(() => {
    let mounted = true;

    void getCategoryListApi()
      .then((response) => {
        if (!mounted) {
          return;
        }

        const nextCategories = response.data.categories || [];
        setCategories(nextCategories);
        setSelectedCategory((current) =>
          current && nextCategories.some((item) => item.slug === current)
            ? current
            : String(nextCategories[0]?.slug || ""),
        );
      })
      .catch((error) => {
        console.error("Fetch categories for display order failed:", error);
        message.error("Failed to load categories.");
      })
      .finally(() => {
        if (mounted) {
          setLoadingCategories(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setArrangement(null);
      setInitialArrangement(null);
      return;
    }

    let mounted = true;
    setLoadingArrangement(true);

    void getProductDisplayOrderApi({ category: selectedCategory })
      .then((response) => {
        if (!mounted) {
          return;
        }

        const nextArrangement = normalizeArrangement({
          hotSellerProducts: response.data.hotSellerProducts || [],
          regularProducts: response.data.regularProducts || [],
        });
        setArrangement(nextArrangement);
        setInitialArrangement(cloneArrangement(nextArrangement));
      })
      .catch((error) => {
        console.error("Fetch product display order failed:", error);
        message.error("Failed to load product display order.");
      })
      .finally(() => {
        if (mounted) {
          setLoadingArrangement(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const handleCategoryChange = (categorySlug: string) => {
    if (!categorySlug || categorySlug === selectedCategory) {
      return;
    }

    if (isDirty) {
      Modal.confirm({
        title: "Discard unsaved order changes?",
        content: "Switching categories will discard the current unsaved arrangement.",
        onOk: () => setSelectedCategory(categorySlug),
      });
      return;
    }

    setSelectedCategory(categorySlug);
  };

  const handleDragStart = (activeId: string) => {
    if (!canWrite || !arrangement) {
      return;
    }

    dragStartArrangementRef.current = cloneArrangement(arrangement);
    setActiveProductId(activeId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canWrite) {
      return;
    }

    const overId = String(event.over?.id || "");
    if (!overId) {
      return;
    }

    setArrangement((current) => {
      if (!current) {
        return current;
      }

      return previewMoveProduct(current, event);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveProductId("");

    if (!canWrite) {
      dragStartArrangementRef.current = null;
      return;
    }

    if (!event.over) {
      setArrangement(cloneArrangement(dragStartArrangementRef.current));
      dragStartArrangementRef.current = null;
      return;
    }

    dragStartArrangementRef.current = null;
  };

  const handleDragCancel = () => {
    setArrangement(cloneArrangement(dragStartArrangementRef.current));
    setActiveProductId("");
    dragStartArrangementRef.current = null;
  };

  const handleReset = () => {
    setArrangement(cloneArrangement(initialArrangement));
  };

  const handleSave = async () => {
    if (!arrangement || !selectedCategory) {
      return;
    }

    try {
      setSaving(true);
      await saveProductDisplayOrderApi({
        category: selectedCategory,
        hotSellerProductIds: arrangement.hotSellerProducts.map((item) => item.id),
        regularProductIds: arrangement.regularProducts.map((item) => item.id),
      });
      const nextArrangement = cloneArrangement(arrangement);
      setInitialArrangement(nextArrangement);
      message.success("Product display order saved.");
    } catch (error) {
      console.error("Save product display order failed:", error);
      message.error("Failed to save product display order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 gap-6">
      <aside className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Title level={4}>Product Display Order</Title>
        <Paragraph type="secondary">Choose a category and arrange Hot Seller items first.</Paragraph>
        {loadingCategories ? (
          <Skeleton active paragraph={{ rows: 6 }} title={false} />
        ) : categories.length > 0 ? (
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                className={
                  category.slug === selectedCategory
                    ? "w-full rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-left text-sm font-semibold text-white"
                    : "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                }
                onClick={() => handleCategoryChange(category.slug)}
                type="button"
              >
                <div
                  className={
                    category.slug === selectedCategory
                      ? "text-sm font-semibold text-white"
                      : "text-sm font-semibold text-slate-900"
                  }
                >
                  {category.name}
                </div>
                <div
                  className={
                    category.slug === selectedCategory
                      ? "mt-1 text-xs text-slate-300"
                      : "mt-1 text-xs text-slate-500"
                  }
                >
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
        ) : (
          <Empty description="No categories found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </aside>

      <main className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>Arrange Category Products</Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Drag products between Hot Seller and Regular Products. Saving here also syncs the Hot Seller switch in the product form.
            </Paragraph>
          </div>
          <div className="flex items-center gap-3">
            {isDirty ? <Tag color="gold">Unsaved Changes</Tag> : <Tag color="green">Saved</Tag>}
            <Button onClick={handleReset} disabled={!isDirty || saving}>Reset Changes</Button>
            <Button type="primary" onClick={handleSave} loading={saving} disabled={!canWrite || !isDirty}>
              Save Order
            </Button>
          </div>
        </div>

        {!canWrite ? (
          <Alert
            className="mb-4"
            message="Read-only access"
            description="You can view the display order but need write permission to save changes."
            type="info"
            showIcon
          />
        ) : null}

        {loadingArrangement ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : arrangement ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => handleDragStart(String(event.active.id || ""))}
            onDragOver={handleDragOver}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 xl:auto-rows-fr xl:grid-cols-2">
              <DroppableColumn
                containerId={HOT_CONTAINER_ID}
                title="Hot Seller"
                products={arrangement.hotSellerProducts}
              />
              <DroppableColumn
                containerId={REGULAR_CONTAINER_ID}
                title="Regular Products"
                products={arrangement.regularProducts}
              />
            </div>
            <DragOverlay>
              {activeProduct ? <ProductCardContent product={activeProduct} dragging /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Empty description="Select a category to start arranging products" />
          </div>
        )}
      </main>
    </div>
  );
}
