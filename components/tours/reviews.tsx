"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import type { TourReview } from "@/lib/tours/types";

const AVATAR_GRADIENTS = [
  "from-[#2b7dff] to-[#0062fa]",
  "from-[#0e7c7b] to-[#0a5c5b]",
  "from-[#5b4bb4] to-[#3d2f8f]",
  "from-[#c45c26] to-[#9a3f18]",
  "from-[#1a6b4a] to-[#0f4d35]",
] as const;

function flagEmoji(countryCode?: string) {
  if (!countryCode || countryCode.length !== 2) return null;
  const code = countryCode.toUpperCase();
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

function initialsFromAuthor(author: string) {
  return author
    .split(/[&\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function gradientForReview(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  }
  return AVATAR_GRADIENTS[hash];
}

type ReviewCardProps = {
  review: TourReview;
  index?: number;
  className?: string;
};

export function ReviewCard({ review, index = 0, className = "" }: ReviewCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const flag = flagEmoji(review.countryCode);

  return (
    <motion.blockquote
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.06 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={`group tour-detail-card tour-detail-card--lift flex h-full flex-col p-6 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientForReview(review.id)} text-sm font-semibold text-white shadow-[0_8px_20px_rgb(0_98_250_/_0.25)] ring-2 ring-white/80`}
          aria-hidden
        >
          {initialsFromAuthor(review.author)}
        </div>
        <div
          className="flex items-center gap-0.5 text-brand"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
          ))}
        </div>
      </div>

      <p className="mt-5 flex-1 font-display text-[1.0625rem] leading-[1.55] tracking-tight text-ink/80">
        &ldquo;{review.quote}&rdquo;
      </p>

      <footer className="mt-6 border-t border-ink/8 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <cite className="not-italic text-sm font-semibold text-ink">
            {review.author}
          </cite>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand/15 bg-brand/8 px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide text-brand">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Verified traveller
          </span>
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink/50">
          {flag ? (
            <span className="text-base leading-none" aria-hidden>
              {flag}
            </span>
          ) : null}
          <span>{review.location}</span>
        </p>
      </footer>
    </motion.blockquote>
  );
}

type ReviewsProps = {
  reviews: TourReview[];
  className?: string;
};

export function Reviews({ reviews, className = "" }: ReviewsProps) {
  return (
    <div className={`tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards lg:grid-cols-3 ${className}`}>
      {reviews.map((review, index) => (
        <ReviewCard key={review.id} review={review} index={index} />
      ))}
    </div>
  );
}
