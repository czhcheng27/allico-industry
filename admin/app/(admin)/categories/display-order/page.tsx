"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RightOutlined } from "@ant-design/icons";
import { Alert, Button, Empty, Skeleton, Tag, Typography, message } from "antd";
import {
  getCategoryDisplayOrderApi,
  saveCategoryDisplayOrderApi,
  type CategoryDisplayOrderRecord,
  type CategorySubcategory,
} from "@/lib/api";
import { hasRouteAction } from "@/lib/permission";
import { useAuthStore } from "@/store/auth-store";

const { Title, Paragraph, Text } = Typography;

const CATEGORY_LIST_ID = "category-list";

type ArrangementState = CategoryDisplayOrderRecord[];

type ActiveDragState =
  | {
      type: "category";
      categoryId: string;
    }
  | {
      type: "subcategory";
      categoryId: string;
      subcategorySlug: string;
    }
  | null;

function getCategoryItemId(categoryId: string) {
  return `category:${categoryId}`;
}

function parseCategoryItemId(id: string) {
  return id.startsWith("category:") ? id.slice("category:".length) : "";
}

function getSubcategoryListId(categoryId: string) {
  return `subcategory-list:${categoryId}`;
}

function parseSubcategoryListId(id: string) {
  return id.startsWith("subcategory-list:")
    ? id.slice("subcategory-list:".length)
    : "";
}

function getSubcategoryItemId(categoryId: string, subcategorySlug: string) {
  return `subcategory:${categoryId}:${subcategorySlug}`;
}

function parseSubcategoryItemId(id: string) {
  if (!id.startsWith("subcategory:")) {
    return null;
  }

  const [, categoryId = "", ...slugParts] = id.split(":");
  const subcategorySlug = slugParts.join(":");

  if (!categoryId || !subcategorySlug) {
    return null;
  }

  return {
    categoryId,
    subcategorySlug,
  };
}

function cloneArrangement(state: ArrangementState | null): ArrangementState | null {
  if (!state) {
    return null;
  }

  return state.map((category) => ({
    ...category,
    subcategories: [...(category.subcategories || [])],
  }));
}

function serializeArrangement(state: ArrangementState | null) {
  return JSON.stringify(
    (state || []).map((category) => ({
      id: category.id,
      subcategorySlugs: (category.subcategories || []).map((item) => item.slug),
    })),
  );
}

function moveCategory(
  state: ArrangementState,
  activeCategoryId: string,
  overId: string,
) {
  const sourceIndex = state.findIndex((item) => item.id === activeCategoryId);
  if (sourceIndex < 0) {
    return state;
  }

  const targetCategoryId =
    parseCategoryItemId(overId) ||
    parseSubcategoryListId(overId) ||
    parseSubcategoryItemId(overId)?.categoryId ||
    "";
  const targetIndex =
    overId === CATEGORY_LIST_ID
      ? state.length - 1
      : state.findIndex((item) => item.id === targetCategoryId);

  if (targetIndex < 0 || targetIndex === sourceIndex) {
    return state;
  }

  return arrayMove(state, sourceIndex, targetIndex);
}

function moveSubcategory(
  state: ArrangementState,
  activeCategoryId: string,
  activeSubcategorySlug: string,
  overId: string,
) {
  const categoryIndex = state.findIndex((item) => item.id === activeCategoryId);
  if (categoryIndex < 0) {
    return state;
  }

  const category = state[categoryIndex];
  const subcategories = [...(category.subcategories || [])];
  const sourceIndex = subcategories.findIndex(
    (item) => item.slug === activeSubcategorySlug,
  );

  if (sourceIndex < 0) {
    return state;
  }

  const overSubcategory = parseSubcategoryItemId(overId);
  const targetCategoryId = overSubcategory?.categoryId || parseSubcategoryListId(overId);

  if (!targetCategoryId || targetCategoryId !== activeCategoryId) {
    return state;
  }

  const targetIndex =
    parseSubcategoryListId(overId) === activeCategoryId
      ? subcategories.length - 1
      : subcategories.findIndex((item) => item.slug === overSubcategory?.subcategorySlug);

  if (targetIndex < 0 || targetIndex === sourceIndex) {
    return state;
  }

  const nextState = [...state];
  nextState[categoryIndex] = {
    ...category,
    subcategories: arrayMove(subcategories, sourceIndex, targetIndex),
  };

  return nextState;
}

function CategoryCardFrame({
  category,
  expanded = false,
  onToggle,
  dragging = false,
  ghost = false,
  canWrite,
  handleAttributes,
  handleListeners,
  children,
}: {
  category: CategoryDisplayOrderRecord;
  expanded?: boolean;
  onToggle?: () => void;
  dragging?: boolean;
  ghost?: boolean;
  canWrite: boolean;
  handleAttributes?: DraggableAttributes;
  handleListeners?: DraggableSyntheticListeners;
  children: ReactNode;
}) {
  return (
    <article
      className={
        dragging
          ? "rounded-2xl border border-slate-300 bg-white p-5 shadow-2xl ring-2 ring-slate-900/10"
          : ghost
            ? "rounded-2xl border border-dashed border-slate-300 bg-slate-100/80 p-5 opacity-40 shadow-sm"
            : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >
      <div
        className={
          canWrite
            ? "flex cursor-grab items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 active:cursor-grabbing"
            : "flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
        }
        {...handleAttributes}
        {...handleListeners}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm text-slate-900">
              {category.name}
            </Text>
            <Tag>{category.subcategories.length}</Tag>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {category.slug}
          </div>
        </div>
        {onToggle ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse subcategories" : "Expand subcategories"}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            onPointerDownCapture={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            <RightOutlined
              className={expanded ? "rotate-90 transition-transform" : "transition-transform"}
            />
          </button>
        ) : null}
      </div>
      {expanded ? <div className="mt-4">{children}</div> : null}
    </article>
  );
}

function SubcategoryRowContent({
  subcategory,
  dragging = false,
  ghost = false,
  canWrite,
}: {
  subcategory: CategorySubcategory;
  dragging?: boolean;
  ghost?: boolean;
  canWrite: boolean;
}) {
  return (
    <div
      className={
        dragging
          ? "rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-xl ring-2 ring-slate-900/10"
          : ghost
            ? "rounded-xl border border-dashed border-slate-300 bg-slate-100/80 px-3 py-2 opacity-40"
            : "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-800">
            {subcategory.name}
          </div>
          <div className="truncate text-xs text-slate-500">{subcategory.slug}</div>
        </div>
        {canWrite ? (
          <span className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            Drag
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SortableSubcategoryRow({
  categoryId,
  subcategory,
  canWrite,
}: {
  categoryId: string;
  subcategory: CategorySubcategory;
  canWrite: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: getSubcategoryItemId(categoryId, subcategory.slug),
      disabled: !canWrite,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={
        isDragging
          ? "cursor-grab opacity-80 active:cursor-grabbing"
          : canWrite
            ? "cursor-grab active:cursor-grabbing"
            : undefined
      }
      {...attributes}
      {...listeners}
    >
      <SubcategoryRowContent
        subcategory={subcategory}
        ghost={isDragging}
        canWrite={canWrite}
      />
    </div>
  );
}

function CategorySubcategoryList({
  category,
  canWrite,
}: {
  category: CategoryDisplayOrderRecord;
  canWrite: boolean;
}) {
  const containerId = getSubcategoryListId(category.id);
  const { isOver, setNodeRef } = useDroppable({ id: containerId });
  const subcategories = category.subcategories || [];

  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "space-y-2 rounded-2xl border-2 border-slate-900 bg-slate-50 p-3"
          : "space-y-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-3"
      }
    >
      <SortableContext
        items={subcategories.map((item) => getSubcategoryItemId(category.id, item.slug))}
        strategy={verticalListSortingStrategy}
      >
        {subcategories.length > 0 ? (
          subcategories.map((subcategory) => (
            <SortableSubcategoryRow
              key={`${category.id}-${subcategory.slug}`}
              categoryId={category.id}
              subcategory={subcategory}
              canWrite={canWrite}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-sm text-slate-400">
            No subcategories
          </div>
        )}
      </SortableContext>
    </div>
  );
}

function SortableCategoryCard({
  category,
  expanded,
  onToggle,
  canWrite,
}: {
  category: CategoryDisplayOrderRecord;
  expanded: boolean;
  onToggle: () => void;
  canWrite: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: getCategoryItemId(category.id),
      disabled: !canWrite,
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-80" : undefined}
    >
      <CategoryCardFrame
        category={category}
        expanded={expanded}
        onToggle={onToggle}
        ghost={isDragging}
        canWrite={canWrite}
        handleAttributes={attributes}
        handleListeners={listeners}
      >
        <CategorySubcategoryList category={category} canWrite={canWrite} />
      </CategoryCardFrame>
    </div>
  );
}

export default function CategoryDisplayOrderPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canWrite = hasRouteAction(permissions, "/categories/display-order", "write");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dragStartArrangementRef = useRef<ArrangementState | null>(null);

  const [arrangement, setArrangement] = useState<ArrangementState | null>(null);
  const [initialArrangement, setInitialArrangement] = useState<ArrangementState | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDragState>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => serializeArrangement(arrangement) !== serializeArrangement(initialArrangement),
    [arrangement, initialArrangement],
  );
  const totalSubcategories = useMemo(
    () =>
      (arrangement || []).reduce(
        (sum, category) => sum + (category.subcategories || []).length,
        0,
      ),
    [arrangement],
  );
  const activeCategory = useMemo(() => {
    if (!arrangement || activeDrag?.type !== "category") {
      return null;
    }

    return arrangement.find((item) => item.id === activeDrag.categoryId) || null;
  }, [activeDrag, arrangement]);
  const activeSubcategory = useMemo(() => {
    if (!arrangement || activeDrag?.type !== "subcategory") {
      return null;
    }

    const category = arrangement.find((item) => item.id === activeDrag.categoryId);
    if (!category) {
      return null;
    }

    return (
      category.subcategories.find((item) => item.slug === activeDrag.subcategorySlug) || null
    );
  }, [activeDrag, arrangement]);

  useEffect(() => {
    let mounted = true;

    void getCategoryDisplayOrderApi()
      .then((response) => {
        if (!mounted) {
          return;
        }

        const categories = response.data.categories || [];
        setArrangement(categories);
        setInitialArrangement(cloneArrangement(categories));
      })
      .catch((error) => {
        console.error("Fetch category display order failed:", error);
        message.error("Failed to load category display order.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!arrangement) {
      setExpandedCategoryIds([]);
      return;
    }

    const validCategoryIds = new Set(arrangement.map((item) => item.id));
    setExpandedCategoryIds((current) =>
      current.filter((categoryId) => validCategoryIds.has(categoryId)),
    );
  }, [arrangement]);

  useEffect(() => {
    if (!isDirty || typeof window === "undefined") {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleClickCapture = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest("a[href]");
      const menuItem = target.closest(".ant-menu-item");

      if (!anchor && !menuItem) {
        return;
      }

      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        if (!href || href.startsWith("#")) {
          return;
        }

        const url = new URL(href, window.location.href);
        if (
          url.origin === window.location.origin &&
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      }

      if (
        !window.confirm(
          "You have unsaved category order changes. Leave this page and discard them?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
        (
          event as MouseEvent & {
            stopImmediatePropagation?: () => void;
          }
        ).stopImmediatePropagation?.();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [isDirty]);

  const handleDragStart = (event: DragStartEvent) => {
    if (!canWrite || !arrangement) {
      return;
    }

    dragStartArrangementRef.current = cloneArrangement(arrangement);
    const activeId = String(event.active.id || "");
    const categoryId = parseCategoryItemId(activeId);

    if (categoryId) {
      setActiveDrag({
        type: "category",
        categoryId,
      });
      return;
    }

    const subcategory = parseSubcategoryItemId(activeId);
    if (subcategory) {
      setActiveDrag({
        type: "subcategory",
        categoryId: subcategory.categoryId,
        subcategorySlug: subcategory.subcategorySlug,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id || "");
    const overId = String(event.over?.id || "");
    setActiveDrag(null);

    if (!canWrite || !arrangement || !activeId || !overId) {
      dragStartArrangementRef.current = null;
      return;
    }

    const categoryId = parseCategoryItemId(activeId);
    if (categoryId) {
      setArrangement((current) =>
        current ? moveCategory(current, categoryId, overId) : current,
      );
      dragStartArrangementRef.current = null;
      return;
    }

    const subcategory = parseSubcategoryItemId(activeId);
    if (subcategory) {
      setArrangement((current) =>
        current
          ? moveSubcategory(
              current,
              subcategory.categoryId,
              subcategory.subcategorySlug,
              overId,
            )
          : current,
      );
    }

    dragStartArrangementRef.current = null;
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
    dragStartArrangementRef.current = null;
  };

  const handleReset = () => {
    setArrangement(cloneArrangement(initialArrangement));
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleSave = async () => {
    if (!arrangement) {
      return;
    }

    try {
      setSaving(true);
      await saveCategoryDisplayOrderApi({
        categories: arrangement.map((category) => ({
          id: category.id,
          subcategorySlugs: (category.subcategories || []).map((item) => item.slug),
        })),
      });
      const nextArrangement = cloneArrangement(arrangement);
      setInitialArrangement(nextArrangement);
      message.success("Category display order saved.");
    } catch (error) {
      console.error("Save category display order failed:", error);
      message.error("Failed to save category display order.");
    } finally {
      setSaving(false);
    }
  };

  const { isOver, setNodeRef } = useDroppable({ id: CATEGORY_LIST_ID });

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Category Display Order
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Drag main categories to reorder the catalog. Drag subcategories only within
            their current main category.
          </Paragraph>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tag>{`${arrangement?.length || 0} categories`}</Tag>
          <Tag>{`${totalSubcategories} subcategories`}</Tag>
          {isDirty ? <Tag color="gold">Unsaved Changes</Tag> : <Tag color="green">Saved</Tag>}
          <Button onClick={handleReset} disabled={!isDirty || saving}>
            Reset Changes
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!canWrite || !isDirty}
          >
            Save Order
          </Button>
        </div>
      </div>

      {!canWrite ? (
        <Alert
          className="mb-4"
          message="Read-only access"
          description="You can review category order but need write permission to save changes."
          type="info"
          showIcon
        />
      ) : null}

      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : arrangement && arrangement.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            ref={setNodeRef}
            className={
              isOver
                ? "min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 border-slate-900 bg-slate-50 p-4"
                : "min-h-0 flex-1 overflow-y-auto rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4"
            }
          >
            <SortableContext
              items={arrangement.map((category) => getCategoryItemId(category.id))}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {arrangement.map((category) => (
                  <SortableCategoryCard
                    key={category.id}
                    category={category}
                    expanded={expandedCategoryIds.includes(category.id)}
                    onToggle={() => toggleCategoryExpanded(category.id)}
                    canWrite={canWrite}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          <DragOverlay>
            {activeCategory ? (
              <CategoryCardFrame
                category={activeCategory}
                expanded={expandedCategoryIds.includes(activeCategory.id)}
                dragging
                canWrite={canWrite}
              >
                <div className="space-y-2">
                  {(activeCategory.subcategories || []).map((subcategory) => (
                    <SubcategoryRowContent
                      key={`${activeCategory.id}-${subcategory.slug}`}
                      subcategory={subcategory}
                      canWrite={canWrite}
                    />
                  ))}
                </div>
              </CategoryCardFrame>
            ) : null}
            {activeSubcategory ? (
              <SubcategoryRowContent subcategory={activeSubcategory} dragging canWrite={canWrite} />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <Empty description="No categories found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </div>
  );
}
