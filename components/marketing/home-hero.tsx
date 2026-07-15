"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { heroMedia } from "@/lib/hero-media";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

const HERO_EASE = [0.22, 1, 0.36, 1] as const;
const HERO_COPY_MS = 0.26;
const HERO_SLIDE_FALLBACK_MS = 8000;
const HERO_SLIDE_COUNT = 3;

const HERO_SLIDE_HREFS = [
  { primary: "/airport", secondary: "/tours" },
  { primary: "/airport", secondary: "/airport" },
  { primary: "/tours", secondary: "/tours" },
] as const;

function slideIndexFromVideo(video: HTMLVideoElement): number {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const ratio = video.currentTime / duration;
  return Math.min(HERO_SLIDE_COUNT - 1, Math.floor(ratio * HERO_SLIDE_COUNT));
}

type JourneyIntent = "arrive" | "stay" | "explore";

const INTENT_HREFS: Record<JourneyIntent, string> = {
  arrive: "/airport",
  stay: "/ride",
  explore: "/tours",
};

const INTENT_IDS = ["arrive", "stay", "explore"] as const;

export function HomeHero() {
  const t = useTranslations();
  const [scrolledPast, setScrolledPast] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const hasVideo = Boolean(heroMedia.videoSrc);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = slideIndexFromVideo(video);
    setSlideIndex((prev) => (prev === next ? prev : next));
  }, []);

  // Poster / reduced-motion fallback — timed slides without scrubbing video.
  useEffect(() => {
    if (hasVideo && !reduceMotion) return;
    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDE_COUNT);
    }, HERO_SLIDE_FALLBACK_MS);
    return () => window.clearInterval(id);
  }, [hasVideo, reduceMotion]);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-map-void text-foam"
      aria-label={t("hero.ariaLabel")}
    >
      <HeroMedia
        hasVideo={hasVideo}
        videoRef={videoRef}
        onTimeUpdate={onVideoTimeUpdate}
      />

      <Container className="relative z-10 flex w-full flex-col pb-10 pt-28 sm:pb-14 lg:pb-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-end lg:gap-x-52 lg:gap-y-12 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] xl:gap-x-64 2xl:gap-x-72">
          {/* Lift copy 72–88px without changing hero height or the booking card */}
          <div className="hero-copy-col max-w-3xl min-w-0 -translate-y-[72px] sm:-translate-y-[80px] lg:-translate-y-[88px]">
            <HeroContent index={slideIndex} reduceMotion={reduceMotion} />
          </div>

          <div className="hero-planner-col reveal-up min-w-0 lg:justify-self-stretch lg:w-full" style={{ animationDelay: "360ms" }}>
            <JourneyPlanner />
            <TrustRow />
          </div>
        </div>
      </Container>

      <button
        type="button"
        onClick={() => {
          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          window.scrollTo({
            top: Math.round(window.innerHeight * 0.92),
            behavior: reduce ? "auto" : "smooth",
          });
        }}
        className={[
          "absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-foam/55 transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
          scrolledPast ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
        aria-label={t("hero.scrollAria")}
      >
        <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">
          {t("hero.scroll")}
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-5 items-start justify-center rounded-full border border-foam/35 pt-1.5"
        >
          <span className="scroll-dot h-1.5 w-1 rounded-full bg-foam/80" />
        </span>
      </button>
    </section>
  );
}

function HeroContent({
  index,
  reduceMotion,
}: {
  index: number;
  reduceMotion: boolean;
}) {
  const { hero } = useMessages();
  const slide = hero.slides[index] ?? hero.slides[0];
  const hrefs = HERO_SLIDE_HREFS[index] ?? HERO_SLIDE_HREFS[0];

  return (
    <div className="hero-content-layout flex w-full min-w-0 flex-col">
      {/* Title — reserved 2-line height, full text, natural wrap */}
      <div
        className="hero-title-slot relative isolate min-h-[calc(2*clamp(2.35rem,7vw,4.75rem)*0.95)]"
        aria-live="polite"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.p
            key={`title-${slide.title}`}
            className="hero-title absolute inset-x-0 top-0 font-display text-[clamp(2.35rem,7vw,4.75rem)] leading-[0.95] tracking-[-0.03em] text-foam text-balance"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
          >
            {slide.title === "Q Pick" ? <>Q&nbsp;Pick</> : slide.title}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Subtitle — 24px after title */}
      <div className="hero-sub-slot relative isolate mt-6 min-h-[calc(2*clamp(1.65rem,3.6vw,2.65rem)*1.15)]">
        <AnimatePresence initial={false} mode="sync">
          <motion.h1
            key={`sub-${slide.subtitle}`}
            className="hero-sub absolute inset-x-0 top-0 font-display text-[clamp(1.65rem,3.6vw,2.65rem)] leading-[1.15] tracking-tight text-foam text-pretty text-balance"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
          >
            {slide.subtitle}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Description — 24px after subtitle */}
      <div className="hero-body-slot relative isolate mt-6 min-h-[3.5rem] sm:min-h-[3.75rem]">
        <AnimatePresence initial={false} mode="sync">
          <motion.p
            key={`body-${slide.description}`}
            className="hero-body absolute inset-x-0 top-0 max-w-[44ch] text-base leading-relaxed text-foam/75 text-pretty sm:max-w-[48ch] sm:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
          >
            {slide.description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Buttons — 40px after description; single horizontal row */}
      <div className="hero-cta-slot relative isolate mt-10 min-h-12 sm:min-h-[3.25rem]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={`cta-${slide.primary}-${slide.secondary}`}
            className="absolute inset-x-0 top-0 flex flex-nowrap items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
          >
            <ButtonLink
              href={hrefs.primary}
              size="lg"
              className="hero-cta-btn shrink-0 whitespace-nowrap"
            >
              {slide.primary}
            </ButtonLink>
            <ButtonLink
              href={hrefs.secondary}
              size="lg"
              variant="onDark"
              className="hero-cta-btn shrink-0 whitespace-nowrap border border-foam/25 bg-foam/10 text-foam backdrop-blur-md hover:bg-foam/18 hover:text-foam"
            >
              {slide.secondary}
            </ButtonLink>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeroMedia({
  hasVideo,
  videoRef,
  onTimeUpdate,
}: {
  hasVideo: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onTimeUpdate: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="hero-media absolute inset-0 overflow-hidden">
      {hasVideo ? (
        <video
          ref={videoRef}
          className="hero-bg-video absolute inset-0 h-full w-full motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroMedia.poster.src}
          aria-hidden="true"
          disablePictureInPicture
          disableRemotePlayback
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onTimeUpdate}
        >
          {/* Mobile first — browsers pick the first matching media source */}
          <source
            src={heroMedia.videoSrcMobile}
            type='video/mp4; codecs="avc1.64001F"'
            media="(max-width: 767px)"
          />
          <source
            src={heroMedia.videoSrc}
            type='video/mp4; codecs="avc1.640028"'
          />
        </video>
      ) : null}

      <Image
        src={heroMedia.poster.src}
        alt={t("hero.posterAlt")}
        fill
        priority
        quality={90}
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR}
        className={[
          hasVideo
            ? "hero-bg-video motion-reduce:block hidden"
            : "object-cover ken-burns",
        ].join(" ")}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/50 to-map-void/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-map-void/60 via-map-void/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgb(7_16_24_/_0.28)_100%)]" />
    </div>
  );
}

function JourneyPlanner() {
  const router = useRouter();
  const t = useTranslations();
  const messages = useMessages();
  const baseId = useId();
  const [intent, setIntent] = useState<JourneyIntent>("arrive");
  const copy = messages.hero.planner[intent];
  const activeHref = useMemo(() => INTENT_HREFS[intent], [intent]);

  return (
    <form
      className="hero-planner flex w-full flex-col gap-4 rounded-[var(--radius-lg)] border border-foam/22 bg-foam/14 px-5 py-5 shadow-[0_12px_40px_rgb(7_16_24_/_0.32)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/12 sm:gap-[1.05rem] sm:px-6 sm:py-5 lg:gap-4 lg:px-8 lg:py-5 xl:px-9 xl:py-5"
      aria-label={t("hero.planner.ariaLabel")}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        const from = String(data.get("from") ?? "").trim();
        const to = String(data.get("to") ?? "").trim();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("intent", intent);
        const query = params.toString();
        router.push(query ? `${activeHref}?${query}` : activeHref);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="hero-planner-title font-display text-xl tracking-tight text-foam sm:text-2xl">
          {t("hero.planner.title")}
        </p>
        <p className="hero-planner-sub max-w-none text-sm leading-relaxed text-foam/60 text-pretty">
          {t("hero.planner.subtitle")}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t("hero.planner.journeyTypeAria")}
        className="flex gap-1 rounded-[var(--radius-md)] border border-foam/15 bg-map-void/30 p-1"
      >
        {INTENT_IDS.map((id) => {
          const selected = id === intent;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setIntent(id)}
              className={[
                "hero-planner-tab min-h-11 flex-1 rounded-[var(--radius-sm)] px-2 text-center text-sm font-medium transition-[background-color,color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] sm:px-3",
                selected
                  ? "bg-foam/95 text-ink"
                  : "text-foam/70 hover:bg-foam/5 hover:text-foam",
              ].join(" ")}
            >
              {t(`hero.planner.intents.${id}`)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3.5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-from`}
            className="hero-planner-label text-xs font-medium tracking-wide text-foam/70 text-pretty"
          >
            {copy.fromLabel}
          </label>
          <input
            key={`${intent}-from`}
            id={`${baseId}-from`}
            name="from"
            type="text"
            defaultValue={copy.fromDefault}
            autoComplete="street-address"
            className="min-h-12 w-full min-w-0 rounded-[var(--radius-md)] border border-foam/20 bg-map-void/35 px-3.5 text-sm text-foam outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-foam/40 focus:border-lagoon"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-to`}
            className="hero-planner-label text-xs font-medium tracking-wide text-foam/70 text-pretty"
          >
            {copy.toLabel}
          </label>
          <input
            key={`${intent}-to`}
            id={`${baseId}-to`}
            name="to"
            type="text"
            defaultValue={copy.toDefault}
            autoComplete="street-address"
            className="min-h-12 w-full min-w-0 rounded-[var(--radius-md)] border border-foam/20 bg-map-void/35 px-3.5 text-sm text-foam outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-foam/40 focus:border-lagoon"
          />
        </div>
      </div>

      <p
        key={intent}
        className="hero-planner-note border-t border-foam/12 pt-4 text-sm leading-relaxed text-foam/70 text-pretty animate-[fade-in_var(--duration-ui)_var(--ease-cinematic)]"
        aria-live="polite"
      >
        {copy.recommendation}
      </p>

      <button
        type="submit"
        className="hero-planner-submit inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-lagoon px-5 text-sm font-medium text-paper transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-lagoon-deep"
      >
        {t("hero.planner.continue")}
      </button>
    </form>
  );
}

function TrustRow() {
  const t = useTranslations();
  const items = [
    "hero.trust.verifiedDrivers",
    "hero.trust.hotelCoordination",
    "hero.trust.clearPricing",
  ] as const;

  return (
    <ul
      className="hero-trust mt-8 grid grid-cols-1 gap-y-3 px-1 text-sm text-foam/65 sm:mt-10 sm:grid-cols-[repeat(3,minmax(0,1fr))] sm:items-stretch sm:gap-0 lg:mt-11"
      aria-label={t("hero.trust.ariaLabel")}
    >
      {items.map((key, index) => (
        <li
          key={key}
          className={[
            "hero-trust-item flex min-h-0 min-w-0 items-center justify-center px-2.5 py-0.5 text-center tracking-wide",
            index > 0 ? "sm:border-l sm:border-foam/25" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="hero-trust-label max-w-full text-balance text-pretty">
            {t(key)}
          </span>
        </li>
      ))}
    </ul>
  );
}
