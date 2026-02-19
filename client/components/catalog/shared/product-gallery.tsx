"use client";

import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

function ProductGallery({ images, alt }: ProductGalleryProps) {
  const normalizedImages = useMemo(
    () => (images.length > 0 ? images : ["/window.svg"]),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = normalizedImages[activeIndex];

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1));
  }, [normalizedImages.length]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1));
  }, [normalizedImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, isLightboxOpen]);

  return (
    <>
      <div className="space-y-6">
        <div
          className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const cursorX = event.clientX - rect.left;
            const cursorY = event.clientY - rect.top;
            const percentX = (cursorX / rect.width) * 100;
            const percentY = (cursorY / rect.height) * 100;

            setZoomPosition({
              x: Math.max(0, Math.min(100, percentX)),
              y: Math.max(0, Math.min(100, percentY)),
            });
            setCursorPosition({
              x: Math.max(0, Math.min(rect.width, cursorX)),
              y: Math.max(0, Math.min(rect.height, cursorY)),
            });
          }}
        >
          <img
            alt={alt}
            className="max-h-full object-contain transition-transform duration-300"
            src={activeImage}
          />

          {isHovering ? (
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <div
                className="absolute h-52 w-52 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-white shadow-2xl ring-1 ring-black/15"
                style={{
                  left: `${cursorPosition.x}px`,
                  top: `${cursorPosition.y}px`,
                }}
              >
                <div
                  className="h-full w-full bg-no-repeat"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundSize: "280%",
                  }}
                />
              </div>
            </div>
          ) : null}

          <button
            className="absolute bottom-4 right-4 rounded-full bg-white/95 p-2 text-gray-700 shadow transition hover:text-black"
            onClick={() => setIsLightboxOpen(true)}
            type="button"
          >
            <ZoomIn className="size-5" />
          </button>

          <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-2">
            <span className="rounded bg-primary px-3 py-1 text-xs font-bold uppercase text-black shadow-sm">
              Premium Grade
            </span>
            <span className="rounded bg-zinc-900 px-3 py-1 text-xs font-bold uppercase text-white shadow-sm">
              USA Made
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {normalizedImages.slice(0, 4).map((image, index) => (
            <button
              key={`${image}-${index}`}
              className={
                activeIndex === index
                  ? "aspect-square overflow-hidden rounded-md border-2 border-primary bg-white p-1"
                  : "aspect-square overflow-hidden rounded-md border border-gray-200 bg-white p-1 transition hover:border-primary"
              }
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <img
                alt={`${alt} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                src={image}
              />
            </button>
          ))}
        </div>
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-6">
          <button
            className="absolute right-6 top-6 rounded-sm border border-zinc-500 px-3 py-1 text-sm font-bold uppercase text-white transition hover:border-white"
            onClick={() => setIsLightboxOpen(false)}
            type="button"
          >
            Close
          </button>

          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={goPrev}
            type="button"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div className="max-h-[85vh] w-full max-w-5xl">
            <img
              alt={`${alt} enlarged`}
              className="max-h-[70vh] w-full object-contain"
              src={activeImage}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {normalizedImages.map((image, index) => (
                <button
                  key={`${image}-${index}-lightbox`}
                  className={
                    activeIndex === index
                      ? "h-14 w-14 overflow-hidden rounded border-2 border-primary"
                      : "h-14 w-14 overflow-hidden rounded border border-zinc-500"
                  }
                  onClick={() => setActiveIndex(index)}
                  type="button"
                >
                  <img
                    alt={`${alt} thumb lightbox ${index + 1}`}
                    className="h-full w-full object-cover"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={goNext}
            type="button"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      ) : null}
    </>
  );
}

export { ProductGallery };
