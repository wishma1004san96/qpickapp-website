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
  { primary: "/ride", secondary: "/tours" },
  { primary: "/ride", secondary: "/tours" },
  { primary: "/tours", secondary: "/ride" },
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
  const [slideIndex, setSlideIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const hasVideo = Boolean(heroMedia.videoSrc);

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
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-map-void text-foam"
      aria-label={t("hero.ariaLabel")}
    >
      <HeroMedia
        hasVideo={hasVideo}
        videoRef={videoRef}
        onTimeUpdate={onVideoTimeUpdate}
      />

      {/* Content + booking card — scroll lives under the floating trust badges */}
      <Container className="relative z-10 flex w-full flex-1 flex-col justify-start pb-28 pt-32 sm:pb-32 sm:pt-36 lg:pb-36 lg:pt-40 xl:pt-44">
        <div className="grid grid-cols-1 gap-y-10 sm:gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,26rem)] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] xl:gap-x-16 2xl:gap-x-20">
          <div className="hero-copy-col min-w-0 max-w-3xl">
            <HeroContent index={slideIndex} reduceMotion={reduceMotion} />
          </div>

          <div
            className="hero-planner-col reveal-up min-w-0 w-full lg:justify-self-end"
            style={{ animationDelay: "360ms" }}
          >
            <JourneyPlanner />
          </div>
        </div>
      </Container>
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
    <div className="hero-content-layout flex w-full min-w-0 flex-col" aria-live="polite">
      {/*
        Flow layout — no fixed slots. Brand → heading → body → CTAs
        with consistent gaps so longer locales wrap without overlap.
      */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`slide-${index}-${slide.title}`}
          className="flex w-full min-w-0 flex-col gap-5 sm:gap-6"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
        >
          <p className="hero-title overflow-visible font-display text-[clamp(2.1rem,6.5vw,4.75rem)] leading-[1.15] tracking-[-0.03em] text-balance text-foam">
            {slide.title === "Q Pick" ? <>Q&nbsp;Pick</> : slide.title}
          </p>

          <h1 className="hero-sub overflow-visible font-display text-[clamp(1.45rem,3.4vw,2.65rem)] leading-[1.3] tracking-tight text-pretty text-balance text-foam">
            {slide.subtitle}
          </h1>

          <p className="hero-body max-w-[44ch] text-base leading-relaxed text-pretty text-foam/75 sm:max-w-[48ch] sm:text-lg">
            {slide.description}
          </p>

          <div className="hero-cta mt-1 flex flex-wrap items-center gap-3 sm:mt-2">
            <ButtonLink
              href={hrefs.primary}
              size="lg"
              className="hero-cta-btn max-w-full shrink-0 whitespace-normal"
            >
              {slide.primary}
            </ButtonLink>
            <ButtonLink
              href={hrefs.secondary}
              size="lg"
              variant="onDark"
              className="hero-cta-btn max-w-full shrink-0 whitespace-normal border border-foam/25 bg-foam/10 text-foam backdrop-blur-md hover:bg-foam/18 hover:text-foam"
            >
              {slide.secondary}
            </ButtonLink>
          </div>
        </motion.div>
      </AnimatePresence>
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
            className="hero-planner flex w-full flex-col gap-4 self-start rounded-[var(--radius-lg)] border border-foam/22 bg-foam/14 px-5 py-5 shadow-[0_12px_40px_rgb(7_16_24_/_0.32)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/12 sm:gap-4 sm:px-6 sm:py-5 lg:min-h-[32.5rem] lg:justify-between lg:gap-y-3 lg:px-8 lg:py-6 xl:px-9"
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
        <p className="hero-planner-sub max-w-none text-sm leading-relaxed text-pretty text-foam/60">
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
            className="hero-planner-label text-xs font-medium tracking-wide text-pretty text-foam/70"
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
            className="hero-planner-label text-xs font-medium tracking-wide text-pretty text-foam/70"
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
        className="hero-planner-note border-t border-foam/12 pt-3.5 text-sm leading-relaxed text-pretty text-foam/70 animate-[fade-in_var(--duration-ui)_var(--ease-cinematic)]"
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
