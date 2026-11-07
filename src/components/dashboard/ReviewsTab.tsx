import { useEffect, useState } from 'react';
import { fetchWorkerReviews } from '@/services/reviews';
import type { Review } from '@/lib/types';
import { cardClass } from '@/lib/styles';
import { ReviewList } from '@/components/profile/ReviewSection';
import { ErrorState, LoadingState } from '@/components/ui/States';
import type { TabProps } from '@/components/dashboard/tabProps';

export default function ReviewsTab({ worker }: TabProps) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setReviews(null);
    setError(false);
    fetchWorkerReviews(worker.id)
      .then((rows) => {
        if (active) setReviews(rows);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [worker.id, attempt]);

  return (
    <div className={`${cardClass} space-y-6 p-6 sm:p-8`}>
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Reviews from customers</h2>
        <p className="text-sm text-slate-500">
          {worker.review_count} review{worker.review_count === 1 ? '' : 's'} so far. Customers can edit their own reviews.
        </p>
      </div>
      {error ? (
        <ErrorState message="We couldn't load your reviews." onRetry={() => setAttempt((value) => value + 1)} />
      ) : reviews === null ? (
        <LoadingState label="Loading reviews..." />
      ) : (
        <ReviewList reviews={reviews} />
      )}
    </div>
  );
}
