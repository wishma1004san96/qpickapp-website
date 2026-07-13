import Image from "next/image";
import type { ReactNode } from "react";

type MediaFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  aspect?: string;
  children?: ReactNode;
};

export function MediaFrame({
  src,
  alt,
  priority = false,
  className = "",
  imageClassName = "",
  aspect = "aspect-[16/10]",
  children,
}: MediaFrameProps) {
  return (
    <div
      className={`relative overflow-hidden ${aspect} bg-mist ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
        className={`object-cover ${imageClassName}`}
      />
      {children}
    </div>
  );
}
