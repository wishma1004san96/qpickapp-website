/**
 * Optional cinematic video background.
 * Poster-first, metadata preload, pause when off-screen.
 */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function VideoBackground({
  src,
  poster,
  className = "",
}: {
  src?: string;
  poster: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;

    let inView = false;
    const sync = () => {
      if (document.hidden || !inView) {
        video.pause();
        return;
      }
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView =
          (entry?.isIntersecting ?? false) &&
          (entry?.intersectionRatio ?? 0) > 0.2;
        sync();
      },
      { threshold: [0, 0.2, 0.5], rootMargin: "80px 0px" },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [src]);

  return (
    <div ref={rootRef} className={`absolute inset-0 overflow-hidden bg-map-void ${className}`}>
      {src ? (
        <video
          ref={videoRef}
          className={[
            "h-full w-full object-cover motion-reduce:hidden transition-opacity duration-500",
            ready ? "opacity-100" : "opacity-0",
          ].join(" ")}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
          onPlaying={() => setReady(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      <Image
        src={poster}
        alt=""
        fill
        sizes="100vw"
        className={[
          "object-cover transition-opacity duration-500",
          src
            ? ready
              ? "pointer-events-none opacity-0 motion-reduce:opacity-100"
              : "opacity-100"
            : "opacity-100",
        ].join(" ")}
        aria-hidden="true"
      />
    </div>
  );
}
