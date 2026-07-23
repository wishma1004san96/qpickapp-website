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
import {
  QHeadingMark,
  QWatermark,
} from "@/components/brand/q-mark";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTrustSection } from "@/components/marketing/hero-trust-section";
import {
  defaultSchedule,
  formatDateInput,
  formatTimeInput,
  isScheduleValid,
  minPickupTimeForDate,
  nowPlusMinutes,
} from "@/lib/booking/schedule";
import { heroMedia } from "@/lib/hero-media";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

const HERO_EASE = [0.22, 1, 0.36, 1] as const;
const HERO_COPY_MS = 0.26;
const HERO_SLIDE_FALLBACK_MS = 8000;
const HERO_SLIDE_COUNT = 3;

const HERO_SLIDE_HREFS = [
  { primary: "/ride", secondary: "/airport" },
  { primary: "/airport", secondary: "/ride" },
  { primary: "/ride", secondary: "/tours" },
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
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const hasVideo = Boolean(heroMedia.videoSrc);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>(heroMedia.videoSrcMobile);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767.98px)").matches;
    setVideoSrc(mobile ? heroMedia.videoSrcMobile : heroMedia.videoSrc);
  }, []);

  const onVideoTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused && video.currentTime > 0.05) {
      setVideoPlaying(true);
    }
    const next = slideIndexFromVideo(video);
    setSlideIndex((prev) => (prev === next ? prev : next));
  }, []);

  // Timed copy slides when video is not driving the timeline.
  useEffect(() => {
    if (videoPlaying) return;
    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDE_COUNT);
    }, HERO_SLIDE_FALLBACK_MS);
    return () => window.clearInterval(id);
  }, [videoPlaying]);

  // iPhone Safari: never gate on prefers-reduced-motion (common on iOS).
  // Never hide the <video> with opacity:0. Force muted before every play().
  useEffect(() => {
    if (!hasVideo) return;
    const video = videoRef.current;
    const root = mediaRef.current;
    if (!video || !root) return;

    console.log("Hero mounted");
    let cancelled = false;
    let unlocked = false;

    const forceMutedInline = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "true");
    };

    const reveal = () => {
      if (cancelled) return;
      setVideoPlaying(true);
      unlocked = true;
      console.log("Hero video playing");
    };

    const tryPlay = () => {
      if (cancelled || document.hidden) return;
      forceMutedInline();
      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          if (!video.paused) reveal();
        }).catch((err) => {
          console.log("Hero video play blocked", String(err?.name || err));
        });
      }
    };

    forceMutedInline();

    const onPlaying = () => reveal();
    const onTimeUpdate = () => {
      if (!video.paused && video.currentTime > 0.05) reveal();
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("canplaythrough", tryPlay);

    tryPlay();
    const timers = [50, 200, 500, 1000, 2000, 4000].map((ms) =>
      window.setTimeout(tryPlay, ms),
    );

    const onVisibility = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Keep retrying until unlocked — Low Power Mode needs a real gesture.
    const onGesture = () => {
      tryPlay();
      if (unlocked) {
        window.removeEventListener("touchstart", onGesture, true);
        window.removeEventListener("touchend", onGesture, true);
        window.removeEventListener("pointerdown", onGesture, true);
        window.removeEventListener("click", onGesture, true);
      }
    };
    window.addEventListener("touchstart", onGesture, true);
    window.addEventListener("touchend", onGesture, true);
    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("click", onGesture, true);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("canplaythrough", tryPlay);
      window.removeEventListener("touchstart", onGesture, true);
      window.removeEventListener("touchend", onGesture, true);
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("click", onGesture, true);
    };
  }, [hasVideo, videoSrc]);

  return (
    <section
      className="relative flex min-h-0 flex-col bg-map-void text-foam lg:min-h-[100svh]"
      aria-label={t("hero.ariaLabel")}
    >
      <HeroMedia
        hasVideo={hasVideo}
        videoSrc={videoSrc}
        mediaRef={mediaRef}
        videoRef={videoRef}
        videoPlaying={videoPlaying}
        onTimeUpdate={onVideoTimeUpdate}
      />

      {/* Content + booking card — content-height on mobile; desktop keeps seam padding */}
      <Container className="relative z-10 flex w-full flex-1 flex-col justify-start px-5 pb-5 pt-[calc(5.25rem+env(safe-area-inset-top))] sm:px-6 sm:pb-14 sm:pt-[calc(7rem+env(safe-area-inset-top))] lg:px-8 lg:pb-36 lg:pt-40 xl:pt-44">
        <div className="grid grid-cols-1 gap-y-7 sm:gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,26rem)] lg:items-start lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] xl:gap-x-16 2xl:gap-x-20">
          <div className="hero-copy-col min-w-0 max-w-3xl">
            <HeroContent index={slideIndex} reduceMotion={reduceMotion} />
          </div>

          <div
            className="hero-planner-col relative z-20 reveal-up min-w-0 w-full lg:justify-self-end"
            style={{ animationDelay: "360ms" }}
          >
            <JourneyPlanner />
          </div>
        </div>
      </Container>

      {/* Trust badges + scroll — inside Hero so media covers the full mobile stack */}
      <HeroTrustSection />
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
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const slideMotion = reduceMotion
    ? { opacity: 1, y: 0 }
    : finePointer
      ? { opacity: 0, y: 12 }
      : { opacity: 0 };
  const slideExit = reduceMotion
    ? { opacity: 1, y: 0 }
    : finePointer
      ? { opacity: 0, y: -8 }
      : { opacity: 0 };

  return (
    <div className="hero-content-layout flex w-full min-w-0 flex-col" aria-live="polite">
      {/*
        Flow layout — no fixed slots. Brand → heading → body → CTAs
        with consistent gaps so longer locales wrap without overlap.
      */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={`slide-${index}`}
          className="flex w-full min-w-0 flex-col gap-3.5 sm:gap-6"
          initial={slideMotion}
          animate={{ opacity: 1, y: 0 }}
          exit={slideExit}
          transition={{ duration: HERO_COPY_MS, ease: HERO_EASE }}
        >
          <p className="hero-title overflow-visible font-display text-[clamp(1.85rem,6vw,4.75rem)] leading-[1.12] tracking-[-0.03em] text-balance text-foam">
            {slide.title === "Q Pick" ? <>Q&nbsp;Pick</> : slide.title}
          </p>

          <h1 className="hero-sub overflow-visible font-display text-[clamp(1.25rem,3.2vw,2.65rem)] leading-[1.28] tracking-tight text-pretty text-balance text-foam">
            {slide.subtitle}
          </h1>

          <p className="hero-body max-w-[44ch] text-[0.9375rem] leading-relaxed text-pretty text-foam/75 sm:max-w-[48ch] sm:text-lg">
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
  videoSrc,
  mediaRef,
  videoRef,
  videoPlaying,
  onTimeUpdate,
}: {
  hasVideo: boolean;
  videoSrc: string;
  mediaRef: RefObject<HTMLDivElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoPlaying: boolean;
  onTimeUpdate: () => void;
}) {
  const t = useTranslations();

  return (
    <div
      ref={mediaRef}
      className="hero-media absolute inset-0 overflow-hidden bg-map-void"
    >
      {hasVideo ? (
        <video
          ref={(node) => {
            videoRef.current = node;
            if (node) {
              node.defaultMuted = true;
              node.muted = true;
              node.volume = 0;
              node.playsInline = true;
              node.setAttribute("muted", "");
              node.setAttribute("playsinline", "");
              node.setAttribute("webkit-playsinline", "true");
            }
          }}
          key={videoSrc}
          className="hero-bg-video absolute inset-0 z-0 h-full w-full object-cover"
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
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {/* Poster sits ABOVE the video. iOS will not autoplay opacity:0 videos —
          so the <video> stays fully visible underneath; we only fade the poster. */}
      <Image
        src={heroMedia.poster.src}
        alt={t("hero.posterAlt")}
        fill
        priority
        quality={75}
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR}
        className={[
          "z-[1] object-cover transition-opacity duration-700 ease-[var(--ease-cinematic)]",
          hasVideo
            ? videoPlaying
              ? "pointer-events-none opacity-0"
              : "opacity-100"
            : "ken-burns opacity-100",
        ].join(" ")}
      />

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-map-void via-map-void/50 to-map-void/30" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-map-void/60 via-map-void/20 to-transparent" />
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_30%_40%,transparent_0%,rgb(7_16_24_/_0.28)_100%)]" />
    </div>
  );
}


const plannerFieldClass =
  "min-h-12 w-full min-w-0 max-w-full rounded-[var(--radius-md)] border border-foam/20 bg-map-void/35 px-3.5 text-sm text-foam outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-foam/40 focus:border-lagoon [color-scheme:dark]";

function JourneyPlanner() {
  const router = useRouter();
  const t = useTranslations();
  const messages = useMessages();
  const baseId = useId();
  const [intent, setIntent] = useState<JourneyIntent>("arrive");
  const copy = messages.hero.planner[intent];
  const activeHref = useMemo(() => INTENT_HREFS[intent], [intent]);

  const [from, setFrom] = useState(copy.fromDefault);
  const [to, setTo] = useState(copy.toDefault);
  const initialSchedule = useMemo(() => defaultSchedule(), []);
  const [travelDate, setTravelDate] = useState(initialSchedule.date);
  const [pickupTime, setPickupTime] = useState(initialSchedule.time);

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (intent !== "explore") return;
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [intent]);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const minDate = formatDateInput(now);
  const minTime = minPickupTimeForDate(travelDate, now);

  useEffect(() => {
    const next = messages.hero.planner[intent];
    setFrom(next.fromDefault);
    setTo(next.toDefault);
    if (intent === "explore") {
      const schedule = defaultSchedule();
      setTravelDate(schedule.date);
      setPickupTime(schedule.time);
    }
  }, [intent, messages.hero.planner]);

  useEffect(() => {
    if (intent !== "explore") return;
    if (
      travelDate === formatDateInput(now) &&
      pickupTime < formatTimeInput(now)
    ) {
      setPickupTime(formatTimeInput(nowPlusMinutes(30, now)));
    }
  }, [intent, travelDate, pickupTime, now]);

  const locationsComplete = from.trim().length > 0 && to.trim().length > 0;
  const exploreScheduleComplete = isScheduleValid(
    travelDate,
    pickupTime,
    now,
  );
  const canContinue =
    intent === "explore"
      ? locationsComplete && exploreScheduleComplete
      : locationsComplete;

  const onTravelDateChange = (value: string) => {
    setTravelDate(value);
    if (value === formatDateInput(now) && pickupTime < formatTimeInput(now)) {
      setPickupTime(formatTimeInput(nowPlusMinutes(30, now)));
    }
  };

  return (
    <form
      className="hero-planner relative z-20 flex w-full flex-col gap-4 self-start overflow-hidden rounded-[var(--radius-lg)] border border-foam/22 bg-foam/14 px-5 py-5 shadow-[0_12px_40px_rgb(7_16_24_/_0.32)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/12 sm:gap-4 sm:px-6 sm:py-5 lg:min-h-[32.5rem] lg:justify-between lg:gap-y-3 lg:px-8 lg:py-6 xl:px-9"
      aria-label={t("hero.planner.ariaLabel")}
      onSubmit={(event) => {
        event.preventDefault();
        if (!canContinue) return;
        const params = new URLSearchParams();
        if (from.trim()) params.set("from", from.trim());
        if (to.trim()) params.set("to", to.trim());
        params.set("intent", intent);
        if (intent === "explore") {
          params.set("date", travelDate);
          params.set("time", pickupTime);
        }
        const query = params.toString();
        router.push(query ? `${activeHref}?${query}` : activeHref);
      }}
    >
      <QWatermark tone="foam" opacity={0.05} size={260} blur={2} />
      <div className="relative z-[1] flex flex-1 flex-col gap-4 lg:justify-between lg:gap-y-3">
      <div className="flex flex-col gap-1.5">
        <QHeadingMark
          as="p"
          tone="foam"
          markSize={22}
          className="hero-planner-title font-display text-xl tracking-tight text-foam sm:text-2xl"
        >
          {t("hero.planner.title")}
        </QHeadingMark>
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
                "hero-planner-tab min-h-11 min-w-0 flex-1 truncate rounded-[var(--radius-sm)] px-1.5 text-center text-[0.8125rem] font-medium transition-[background-color,color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] sm:px-3 sm:text-sm",
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
            id={`${baseId}-from`}
            name="from"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            autoComplete="street-address"
            required
            className={plannerFieldClass}
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
            id={`${baseId}-to`}
            name="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoComplete="street-address"
            required
            className={plannerFieldClass}
          />
        </div>

        {intent === "explore" ? (
          <div className="grid gap-3 border-t border-foam/12 pt-3.5 sm:grid-cols-2 sm:gap-3.5">
            <p className="hero-planner-label text-xs font-medium tracking-wide text-pretty text-foam/70 sm:col-span-2">
              {t("hero.planner.scheduleTitle")}
            </p>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label
                htmlFor={`${baseId}-travel-date`}
                className="hero-planner-label text-xs font-medium tracking-wide text-pretty text-foam/70"
              >
                {t("hero.planner.travelDate")}
                <span className="text-brand-bright"> *</span>
              </label>
              <input
                id={`${baseId}-travel-date`}
                name="date"
                type="date"
                required
                min={minDate}
                value={travelDate}
                onChange={(e) => onTravelDateChange(e.target.value)}
                className={plannerFieldClass}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <label
                htmlFor={`${baseId}-pickup-time`}
                className="hero-planner-label text-xs font-medium tracking-wide text-pretty text-foam/70"
              >
                {t("hero.planner.pickupTime")}
                <span className="text-brand-bright"> *</span>
              </label>
              <input
                id={`${baseId}-pickup-time`}
                name="time"
                type="time"
                required
                min={minTime}
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className={plannerFieldClass}
              />
            </div>
          </div>
        ) : null}
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
        disabled={!canContinue}
        className="hero-planner-submit inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-lagoon px-5 text-sm font-medium text-paper transition-[colors,opacity] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-lagoon-deep disabled:pointer-events-none disabled:opacity-40"
      >
        {t("hero.planner.continue")}
      </button>
      </div>
    </form>
  );
}
