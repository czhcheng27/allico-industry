"use client";

/* 更新说明（2026-02-20）： OverlayProvider 懒加载统一 modal/drawer 容器，并通过 context 暴露 API。 */

import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DrawerAPI } from "@/components/overlay/DrawerContainer";
import type { ModalAPI } from "@/components/overlay/ModalContainer";

const LazyModalContainer = lazy(() => import("@/components/overlay/ModalContainer"));
const LazyDrawerContainer = lazy(() => import("@/components/overlay/DrawerContainer"));

type OverlayContextType = {
  modal: ModalAPI | null;
  drawer: DrawerAPI | null;
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export function useOverlay() {
  return useContext(OverlayContext);
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [modalAPI, setModalAPI] = useState<ModalAPI | null>(null);
  const [drawerAPI, setDrawerAPI] = useState<DrawerAPI | null>(null);

  const value = useMemo(
    () => ({
      modal: modalAPI,
      drawer: drawerAPI,
    }),
    [modalAPI, drawerAPI],
  );

  return (
    <OverlayContext.Provider value={value}>
      <Suspense fallback={null}>
        <LazyModalContainer setAPI={setModalAPI} />
        <LazyDrawerContainer setAPI={setDrawerAPI} />
      </Suspense>
      {children}
    </OverlayContext.Provider>
  );
}
