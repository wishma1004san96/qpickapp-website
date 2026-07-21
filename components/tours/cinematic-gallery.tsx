"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { TourGalleryImage } from "@/lib/tours/types";

type CinematicGalleryProps = {
  images: TourGalleryImage[];
  showVideoPlaceholder?: boolean;
  className?: string;
};

export function CinematicGallery({
  images,
  showVideoPlaceholder = true,
  className = "",
}: CinematicGalleryProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (lightbox == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && lightbox != null) {
        setLightbox((i) => (i == null ? 0 : (i + 1) % images.length));
      }
      if (e.key === "ArrowLeft" && lightbox != null) {
        setLightbox((i) =>
          i == null ? 0 : (i - 1 + images.length) % images.length,
        );
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length, close]);

  if (images.length === 0) return null;

  const [hero, ...rest] = images;

  return (
    <div className={className}>
      <div className="grid gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-4">
        <button
          type="button"
          onClick={() => setLightbox(0)}
          className="group relative aspect-[16/10] overflow-hidden rounded-[1.35rem] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[420px]"
        >
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-map-void/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="absolute bottom-4 left-4 rounded-full bg-map-void/70 px-3 py-1 text-xs font-semibold text-foam backdrop-blur-md">
            Open gallery
          </span>
        </button>

        {showVideoPlaceholder ? (
          <div className="relative flex aspect-[16/10] flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border border-ink/8 bg-gradient-to-br from-[#0b1c28] to-[#1a3344] md:col-span-5 md:aspect-auto">
            <Play className="h-10 w-10 text-foam/40" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-foam/80">
              Cinematic film
            </p>
            <p className="mt-1 max-w-[14rem] text-center text-xs text-foam/45">
              Video placeholder — original journey films will appear here when
              published.
            </p>
          </div>
        ) : null}

        {rest.slice(0, showVideoPlaceholder ? 1 : 2).map((image, i) => {
          const index = i + 1;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setLightbox(index)}
              className="group relative aspect-[16/10] overflow-hidden rounded-[1.35rem] md:col-span-5 md:aspect-auto"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </button>
          );
        })}
      </div>

      {rest.length > (showVideoPlaceholder ? 1 : 2) ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {rest.slice(showVideoPlaceholder ? 1 : 2).map((image, i) => {
            const index = i + (showVideoPlaceholder ? 2 : 3);
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setLightbox(index)}
                className="relative h-24 w-36 shrink-0 overflow-hidden rounded-[1rem]"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="144px"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      <AnimatePresence>
        {lightbox != null ? (
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Gallery lightbox"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-map-void/92 p-4 backdrop-blur-md"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 rounded-full bg-foam/10 p-2 text-foam hover:bg-foam/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              initial={reduceMotion ? false : { scale: 0.96 }}
              animate={{ scale: 1 }}
              className="relative h-[min(80vh,720px)] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightbox]?.src ?? hero.src}
                alt={images[lightbox]?.alt ?? hero.alt}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-foam/50">
              {lightbox + 1} / {images.length} · ← → to navigate
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
