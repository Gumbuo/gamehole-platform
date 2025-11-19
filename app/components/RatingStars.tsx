"use client";

import { useState } from "react";

interface RatingStarsProps {
  slug: string;
  initialRating?: number;
  initialCount?: number;
}

export default function RatingStars({
  slug,
  initialRating = 0,
  initialCount = 0,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [userRated, setUserRated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialCount);

  const handleRate = async (rating: number) => {
    if (userRated || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/rate-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating }),
      });

      if (res.ok) {
        setUserRated(true);
        // Update average rating
        const newCount = ratingCount + 1;
        const newSum = averageRating * ratingCount + rating;
        setAverageRating(newSum / newCount);
        setRatingCount(newCount);
      }
    } catch (error) {
      console.error("Failed to rate game:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !userRated && setHoverRating(star)}
            onMouseLeave={() => !userRated && setHoverRating(0)}
            disabled={userRated || submitting}
            className={`text-3xl transition-all ${
              userRated || submitting
                ? "cursor-default opacity-50"
                : "cursor-pointer hover:scale-110"
            }`}
          >
            {star <= (hoverRating || averageRating) ? "⭐" : "☆"}
          </button>
        ))}
      </div>

      <div className="text-gray-300">
        {userRated ? (
          <span className="text-green-400">Thanks for rating!</span>
        ) : ratingCount > 0 ? (
          <span>
            {averageRating.toFixed(1)} / 5.0 ({ratingCount}{" "}
            {ratingCount === 1 ? "rating" : "ratings"})
          </span>
        ) : (
          <span className="text-gray-400">No ratings yet - be the first!</span>
        )}
      </div>
    </div>
  );
}
