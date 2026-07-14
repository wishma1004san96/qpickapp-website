from pathlib import Path

p = Path(r"D:/quickpickapp/components/marketing/experience-phone-live.tsx")
text = p.read_text(encoding="utf-8")

head_end = text.index("/**\n * Premium live ride-tracking map")
basemap_start = text.index("/** Rich original city basemap")

new_mid = r'''/**
 * Premium live ride-tracking map inside the phone.
 * Original map artwork — not Google/Apple assets.
 * Vehicle leads; blue trail never extends ahead of it.
 */
export function ExperiencePhoneLive({
  reduceMotion: reduceMotionProp,
}: {
  active?: boolean;
  reduceMotion: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const prefersReduced = useReducedMotion();
  const reduceMotion = reduceMotionProp || Boolean(prefersReduced);

  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);
  const carX = useMotionValue(64);
  const carY = useMotionValue(412);
  const carAngle = useMotionValue(-90);
  const zoom = useMotionValue(1);
  const fade = useMotionValue(0);

  // Heavy damping on turns only — position stays locked to path (vehicle = leader)
  const smoothAngle = useSpring(carAngle, {
    stiffness: 55,
    damping: 22,
    mass: 1.1,
  });

  // Camera follows with inertia; biased toward destination so it stays in view
  const camX = useMotionValue(64);
  const camY = useMotionValue(412);
  const smoothCamX = useSpring(camX, {
    stiffness: 38,
    damping: 24,
    mass: 1.35,
  });
  const smoothCamY = useSpring(camY, {
    stiffness: 38,
    damping: 24,
    mass: 1.35,
  });
  const smoothZoom = useSpring(zoom, {
    stiffness: 70,
    damping: 24,
    mass: 0.85,
  });

  // Trail end === vehicle progress exactly (never ahead)
  const pathLength = progress;

  const DEST = { x: 248, y: 82 };
  const PICKUP = { x: 64, y: 412 };
  const DEST_BIAS = 0.28;

  const worldX = useTransform(
    smoothCamX,
    (x) => `${50 - (x / VB_W) * 100}%`,
  );
  const worldY = useTransform(
    smoothCamY,
    (y) => `${50 - (y / VB_H) * 100}%`,
  );
  const origin = useTransform(
    [smoothCamX, smoothCamY],
    ([x, y]) =>
      `${((x as number) / VB_W) * 100}% ${((y as number) / VB_H) * 100}%`,
  );

  const carLeft = useTransform(carX, (x) => `${(x / VB_W) * 100}%`);
  const carTop = useTransform(carY, (y) => `${(y / VB_H) * 100}%`);
  const mapOpacity = useTransform(fade, (v) => 1 - v);

  const syncCarToPath = useCallback(
    (t: number) => {
      const path = pathRef.current;
      if (!path) return;
      const len = path.getTotalLength();
      if (len <= 0) return;

      const clamped = Math.max(0, Math.min(1, t));
      const d = clamped * len;
      const point = path.getPointAtLength(d);
      // Tiny look-ahead for heading only (not trail)
      const look = path.getPointAtLength(Math.min(len, d + 1.2));
      const angle =
        (Math.atan2(look.y - point.y, look.x - point.x) * 180) / Math.PI + 90;

      carX.set(point.x);
      carY.set(point.y);
      carAngle.set(angle);

      camX.set(point.x * (1 - DEST_BIAS) + DEST.x * DEST_BIAS);
      camY.set(point.y * (1 - DEST_BIAS) + DEST.y * DEST_BIAS);
    },
    [carX, carY, carAngle, camX, camY],
  );

  useMotionValueEvent(progress, "change", syncCarToPath);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    let cancelled = false;
    const controls: Array<{ stop: () => void }> = [];

    const run = async () => {
      if (reduceMotion) {
        progress.set(0.55);
        syncCarToPath(0.55);
        zoom.set(1.1);
        fade.set(0);
        return;
      }

      progress.set(0);
      syncCarToPath(0);
      fade.set(0);
      zoom.set(1);

      const zoomIn = animate(zoom, 1.1, {
        duration: 1.4,
        ease: [0.22, 1, 0.36, 1],
      });
      controls.push(zoomIn);
      await zoomIn;
      if (cancelled) return;

      while (!cancelled) {
        const trip = animate(progress, 1, {
          duration: 20,
          ease: [0.42, 0, 0.58, 1],
        });
        controls.push(trip);
        await trip;
        if (cancelled) return;

        await new Promise<void>((resolve) => {
          const id = window.setTimeout(resolve, 2000);
          controls.push({ stop: () => window.clearTimeout(id) });
        });
        if (cancelled) return;

        const fadeOut = animate(fade, 1, {
          duration: 0.75,
          ease: [0.4, 0, 0.2, 1],
        });
        controls.push(fadeOut);
        await fadeOut;
        if (cancelled) return;

        progress.set(0);
        syncCarToPath(0);
        camX.jump(PICKUP.x * (1 - DEST_BIAS) + DEST.x * DEST_BIAS);
        camY.jump(PICKUP.y * (1 - DEST_BIAS) + DEST.y * DEST_BIAS);
        carAngle.jump(-90);

        const fadeIn = animate(fade, 0, {
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        });
        controls.push(fadeIn);
        await fadeIn;
      }
    };

    void run();

    return () => {
      cancelled = true;
      controls.forEach((c) => c.stop());
    };
  }, [
    reduceMotion,
    progress,
    zoom,
    fade,
    syncCarToPath,
    camX,
    camY,
    carAngle,
  ]);

  return (
    <div className="experience-live">
      <div className="experience-live-map" aria-hidden="true">
        <motion.div
          className="experience-live-world"
          style={{
            x: worldX,
            y: worldY,
            scale: smoothZoom,
            transformOrigin: origin,
            opacity: mapOpacity,
          }}
        >
          <CityBasemap uid={uid} />

          <svg
            className="experience-live-nav"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient
                id={`exp-route-${uid}`}
                x1="64"
                y1="412"
                x2="248"
                y2="82"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1A73E8" />
                <stop offset="1" stopColor="#0A84FF" />
              </linearGradient>
            </defs>

            <path
              ref={pathRef}
              d={ROUTE_D}
              fill="none"
              stroke="transparent"
              strokeWidth={1}
            />

            <motion.path
              d={ROUTE_D}
              fill="none"
              stroke="rgb(255 255 255 / 0.95)"
              strokeWidth={4.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength }}
            />
            <motion.path
              d={ROUTE_D}
              fill="none"
              stroke={`url(#exp-route-${uid})`}
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength }}
            />
          </svg>

          <div
            className="experience-live-pin experience-live-pin--pickup"
            style={{
              left: `${(PICKUP.x / VB_W) * 100}%`,
              top: `${(PICKUP.y / VB_H) * 100}%`,
            }}
          >
            <span className="experience-live-pin-head experience-live-pin-head--pickup" />
            <span className="experience-live-pin-pulse experience-live-pin-pulse--pickup" />
          </div>

          <div
            className="experience-live-pin experience-live-pin--drop"
            style={{
              left: `${(DEST.x / VB_W) * 100}%`,
              top: `${(DEST.y / VB_H) * 100}%`,
            }}
          >
            <span className="experience-live-pin-head experience-live-pin-head--drop" />
            <span className="experience-live-pin-pulse experience-live-pin-pulse--drop" />
          </div>

          <motion.div
            className="experience-live-car"
            style={{
              left: carLeft,
              top: carTop,
              rotate: smoothAngle,
            }}
          >
            <span className="experience-live-car-glow" />
            <span className="experience-live-car-body" />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="experience-live-status"
        initial={reduceMotion ? false : { y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ left: "50%", x: "-50%" }}
      >
        <span className="experience-live-status-dot" />
        <span className="experience-live-status-text">Ride confirmed</span>
      </motion.div>

      <motion.div
        className="experience-live-sheet"
        initial={reduceMotion ? false : { y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
      >
        <div className="experience-live-card">
          <div className="experience-live-ride-row">
            <div className="experience-live-avatar" aria-hidden="true">
              <span className="experience-live-avatar-initial">K</span>
            </div>
            <div className="experience-live-ride-copy">
              <p className="experience-live-card-title">Kasun · Toyota Premio</p>
              <p className="experience-live-card-sub">
                En route · CMB → Galle Face
              </p>
            </div>
            <div className="experience-live-eta">
              <span>6</span>
              <small>min</small>
            </div>
          </div>
          <div className="experience-live-card-footer">
            <span className="experience-live-plate">CAB-4821</span>
            <span className="experience-live-rating">★ 4.9</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'''

# Keep constants/header before Premium comment, and basemap after
prefix = text[:head_end]
# Ensure ROUTE_D block ends with newline before our function
p.write_text(prefix + new_mid + text[basemap_start:], encoding="utf-8")
print("rewrote ExperiencePhoneLive")
