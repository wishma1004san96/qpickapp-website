import type { TourReview } from "@/lib/tours/types";

type ReviewCardProps = {
  review: TourReview;
  className?: string;
};

export function ReviewCard({ review, className = "" }: ReviewCardProps) {
  return (
    <blockquote
      className={`flex h-full flex-col rounded-[1.35rem] border border-ink/8 bg-white/80 p-6 shadow-[0_12px_32px_rgb(10_22_32_/_0.06)] ${className}`}
    >
      <p className="text-brand" aria-label={`${review.rating} out of 5 stars`}>
        {"★".repeat(review.rating)}
      </p>
      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/75">
        “{review.quote}”
      </p>
      <footer className="mt-5 border-t border-ink/8 pt-4">
        <cite className="not-italic text-sm font-semibold text-ink">
          {review.author}
        </cite>
        <p className="text-xs text-ink/45">{review.location}</p>
      </footer>
    </blockquote>
  );
}

type ReviewsProps = {
  reviews: TourReview[];
  className?: string;
};

export function Reviews({ reviews, className = "" }: ReviewsProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
