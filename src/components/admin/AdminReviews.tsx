import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { deleteReview, fetchAllReviews } from '@/services/reviews';
import { buttonDanger, cardClass } from '@/lib/styles';
import { formatJoinDate } from '@/lib/format';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAsyncList } from '@/hooks/useAsyncList';

export default function AdminReviews() {
  const { items: reviews, loading, error, reload } = useAsyncList(fetchAllReviews);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    setActionError(null);
    try {
      await deleteReview(reviewId);
      setConfirmId(null);
      reload();
    } catch {
      setActionError("We couldn't remove that review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading reviews..." />;
  if (error) return <ErrorState message="We couldn't load reviews." onRetry={reload} />;
  if (reviews.length === 0) return <EmptyState title="No reviews yet" description="Reviews from customers show up here for moderation." />;

  return (
    <section className="space-y-4">
      {actionError && <p role="status" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{actionError}</p>}
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className={`${cardClass} flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between`}>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-bold text-slate-900">{review.author_name || 'Customer'}</span>
                <span className="text-slate-400">on</span>
                <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                  <Star className="h-3.5 w-3.5" aria-hidden="true" />
                  {review.worker?.profile?.full_name ?? 'Worker'}
                </span>
                <span className="text-xs text-slate-400">{formatJoinDate(review.created_at)}</span>
              </div>
              <StarRating value={review.rating} />
              {review.comment && <p className="text-sm leading-relaxed text-slate-600">{review.comment}</p>}
            </div>
            {confirmId === review.id ? (
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setConfirmId(null)} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                  Cancel
                </button>
                <button type="button" onClick={() => handleDelete(review.id)} disabled={deletingId === review.id} className={buttonDanger}>
                  {deletingId === review.id ? 'Removing...' : 'Delete review'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(review.id)}
                aria-label="Delete review"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
