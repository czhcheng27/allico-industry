"use client";

/* 更新说明（2026-02-20）： 该 hook 会按容器高度计算表格 scroll.y，保证不同视口下列表布局稳定。 */

import { useEffect, useRef, useState } from "react";

export function useTableScrollHeight(extraHeight = 55) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(400);

  useEffect(() => {
    const updateScrollY = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setScrollY(Math.max(height - extraHeight, 200));
      }
    };

    updateScrollY();
    window.addEventListener("resize", updateScrollY);
    return () => {
      window.removeEventListener("resize", updateScrollY);
    };
  }, [extraHeight]);

  return { containerRef, scrollY };
}
