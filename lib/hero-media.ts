/**
 * Hero media config — swap in the final 4K Sri Lanka film without touching layout.
 *
 * To go live with video:
 * 1. Place the file at `public/videos/q-pick-hero.mp4` (or update `videoSrc`)
 * 2. Set `videoSrc` below to that path
 * 3. Keep `poster` as the LCP still / video poster (real Sri Lanka)
 */
export const heroMedia = {
  /**
   * Empty until final 4K asset is ready.
   * Example: "/videos/q-pick-hero.mp4"
   */
  videoSrc: "",
  poster: {
    /** Sigiriya (Lion Rock), Sri Lanka — aerial */
    src: "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=2400&q=80",
    alt: "Aerial view of Sigiriya Rock Fortress rising from the Sri Lankan jungle",
  },
} as const;
