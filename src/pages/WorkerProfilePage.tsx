import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWorkerDetail } from '@/services/workers';
import { fetchWorkerReviews } from '@/services/reviews';
import { containerClass, cardClass, sectionTitleClass, buttonSecondary } from '@/lib/styles';
import { initialsOf } from '@/lib/format';
import type { Review, WorkerDetail } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import AvailabilityPill from '@/components/workers/AvailabilityPill';
import ContactPanel from '@/components/profile/ContactPanel';
import PortfolioGallery from '@/components/profile/PortfolioGallery';
import { ReviewForm, ReviewList } from '@/components/profile/ReviewSection';

export default function WorkerProfilePage() {
  const { workerId = '' } = useParams();
  const { session, profile } = useAuth();
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, reviewRows] = await Promise.all([fetchWorkerDetail(workerId), fetchWorkerReviews(workerId)]);
      setWorker(detail);
      setReviews(reviewRows);
    } catch {
      setError("We couldn't load this profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className={containerClass}><LoadingState label="Loading profile..." /></div>;
  if (error) return <div className={`${containerClass} py-16`}><ErrorState message={error} onRetry={load} /></div>;
  if (!worker || worker.approval_status !== 'approved') {
    return (
      <div className={`${containerClass} py-16`}>
        <EmptyState
          title="Profile not found"
          description="This professional may have moved, or their profile is not available yet."
          action={<Link to="/workers" className={buttonSecondary}>Browse professionals</Link>}
        />
      </div>
    );
  }

  const name = worker.profile?.full_name || 'kaamWala professional';
  const location = [worker.area, worker.city].filter(Boolean).join(', ');
  const myReview = session ? reviews.find((review) => review.customer_id === session.user.id) ?? null : null;
  const canReview = profile?.role === 'customer';

  return (
    <div className="bg-slate-50 pb-16">
      <div className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-teal-800 to-slate-950" aria-hidden="true" />
        <div className="hero-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className={`${containerClass} relative py-10 sm:py-14`}>
          <Link to="/workers" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-100 transition hover:-translate-x-1 hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All professionals
          </Link>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {worker.profile?.avatar_url ? (
              <Avatar src={worker.profile.avatar_url} name={name} size="lg" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 text-3xl font-extrabold ring-4 ring-white/20 backdrop-blur">
                {initialsOf(name)}
              </span>
            )}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold sm:text-4xl">{name}</h1>
                <BadgeCheck className="h-6 w-6 text-amber-300" aria-label="Approved professional" />
              </div>
              <p className="max-w-2xl text-base text-teal-50/90">{worker.headline || 'Skilled professional'}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-teal-50/90">
                <span className="flex items-center gap-2">
                  <StarRating value={worker.avg_rating} />
                  {worker.review_count > 0 ? `${worker.avg_rating.toFixed(1)} (${worker.review_count} reviews)` : 'No reviews yet'}
                </span>
                {location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                  {worker.years_experience} yrs experience
                </span>
              </div>
              <AvailabilityPill worker={worker} />
            </div>
          </div>
        </div>
      </div>

      <div className={`${containerClass} grid gap-8 py-10 lg:grid-cols-[1fr_22rem]`}>
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <h2 className={sectionTitleClass}>Services</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {worker.worker_categories.map((link) => (
                <div key={link.category.id} className={`${cardClass} flex items-start gap-3 p-5`}>
                  <span className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700">{link.category.name}</span>
                  {link.expertise && <p className="text-sm text-slate-600">{link.expertise}</p>}
                </div>
              ))}
            </div>
            {worker.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {worker.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          {worker.bio && (
            <section className="space-y-4">
              <h2 className={sectionTitleClass}>About</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{worker.bio}</p>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className={sectionTitleClass}>Portfolio</h2>
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Service area {worker.service_radius_km} km
              </span>
            </div>
            <PortfolioGallery images={worker.portfolio_images} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className={sectionTitleClass}>Customer reviews</h2>
              <span className="text-sm font-semibold text-slate-500">{worker.review_count} total</span>
            </div>
            {canReview && session && (
              <ReviewForm key={myReview?.id ?? 'new'} workerId={worker.id} existing={myReview} onSaved={load} />
            )}
            {!session && (
              <div className={`${cardClass} flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between`}>
                <p className="text-sm text-slate-600">Hired this professional? Log in as a customer to leave a review.</p>
                <Link to="/login" className={buttonSecondary}>Log in to review</Link>
              </div>
            )}
            <ReviewList reviews={reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ContactPanel worker={worker} />
        </aside>
      </div>
    </div>
  );
}
