import { useState, type FormEvent } from 'react';
import { Star } from 'lucide-react';
import { submitReview, updateReview } from '@/services/reviews';
import { buttonPrimary, inputClass, labelClass, cardClass } from '@/lib/styles';
import { formatJoinDate } from '@/lib/format';
import type { Review } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/States';

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" description="Reviews from customers appear here after they hire this professional." />;
  }
  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li key={review.id} className={`${cardClass} p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-6`}>
          <div className="flex items-start gap-4">
            <Avatar src={null} name={review.author_name || 'Customer'} size="sm" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-900">{review.author_name || 'Customer'}</p>
                <span className="text-xs text-slate-400">{formatJoinDate(review.created_at)}</span>
              </div>
              <StarRating value={review.rating} />
              {review.comment && <p className="text-sm leading-relaxed text-slate-600">{review.comment}</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

interface ReviewFormProps {
  workerId: string;
  existing: Review | null;
  onSaved: () => void;
}

export function ReviewForm({ workerId, existing, onSaved }: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating < 1) {
      setError('Please choose a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      if (existing) {
        await updateReview(existing.id, rating, comment.trim());
      } else {
        await submitReview(workerId, rating, comment.trim());
      }
      setSaved(true);
      onSaved();
    } catch {
      setError("We couldn't save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-5 p-6`}>
      <div>
        <p className="text-base font-extrabold text-slate-900">{existing ? 'Update your review' : 'Share your experience'}</p>
        <p className="text-sm text-slate-500">Honest feedback helps other customers choose well.</p>
      </div>

      <fieldset>
        <legend className={labelClass}>Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= (hover || rating);
            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHover(value)}
                onClick={() => setRating(value)}
                className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                aria-pressed={rating === value}
              >
                <Star className={`h-8 w-8 transition ${active ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-comment" className={labelClass}>
          Comments <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="How was the work, punctuality and pricing?"
          className={inputClass}
        />
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
      {saved && !error && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Thanks, your review is saved.</p>}

      <button type="submit" disabled={submitting} className={buttonPrimary}>
        {submitting ? 'Saving...' : existing ? 'Update review' : 'Post review'}
      </button>
    </form>
  );
}
