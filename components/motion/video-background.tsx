/**
 * Optional cinematic video background.
 * Falls back to poster image when video is unavailable or reduced motion is preferred.
 */
import Image from "next/image";

export function VideoBackground({
  src,
  poster,
  className = "",
}: {
  src?: string;
  poster: string;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {src ? (
        <video
          className="h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      <Image
        src={poster}
        alt=""
        fill
        sizes="100vw"
        className={`object-cover ${src ? "motion-reduce:block hidden" : "block"}`}
        aria-hidden="true"
      />
    </div>
  );
}
