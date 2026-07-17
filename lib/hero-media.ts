/**
 * Hero media — cinematic driving POV.
 *
 * Desktop/tablet: 1080p H.264 (faststart, CRF ~26)
 * Mobile: 720p H.264 (lighter for cellular / small screens)
 *
 * Playback: preload=metadata, poster-first fade-in, pause when off-screen.
 */
export const heroMedia = {
  videoSrc: "/videos/q-pick-hero.mp4",
  videoSrcMobile: "/videos/q-pick-hero-mobile.mp4",
  poster: {
    src: "/images/hero/q-pick-hero-poster.jpg",
    alt: "Scenic drive through misty Sri Lankan forest roads",
  },
} as const;
