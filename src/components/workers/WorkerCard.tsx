import { useTilt } from '@/hooks/useTilt';
import { formatDistance, formatRate, initialsOf } from '@/lib/format';
import type { WorkerListing } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import AvailabilityPill from '@/components/workers/AvailabilityPill';
import { BadgeCheck, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkerCard({ worker, distance }: { worker: WorkerListing; distance: number | null }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>(7);
  const name = worker.profile?.full_name || 'kaamWala professional';
  const visibleCategories = worker.worker_categories.slice(0, 2);
  const extraCount = worker.worker_categories.length - visibleCategories.length;
  const location = [worker.area, worker.city].filter(Boolean).join(', ');

  return (
    <Link
      ref={ref}
      to={`/workers/${worker.id}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-slate-900/5 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-2xl hover:shadow-brand-900/10 [transform-style:preserve-3d] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.45), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="relative h-20 bg-gradient-to-br from-brand-500 via-teal-600 to-cyan-800">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:14px_14px]" />
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {distance !== null ? formatDistance(distance) : `${worker.service_radius_km} km radius`}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-4 px-5 pb-5">
        <div className="-mt-9 flex items-end justify-between gap-3">
          <div className="transition duration-500 group-hover:[transform:translateZ(24px)]">
            {worker.profile?.avatar_url ? (
              <Avatar src={worker.profile.avatar_url} name={name} size="md" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-brand-700 shadow-lg ring-4 ring-white">
                {initialsOf(name)}
              </span>
            )}
          </div>
          <AvailabilityPill worker={worker} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-lg font-extrabold text-slate-900">{name}</h3>
            <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Approved professional" />
          </div>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">{worker.headline || 'Skilled professional'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {visibleCategories.map((link) => (
            <span key={link.category.id} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {link.category.name}
            </span>
          ))}
          {extraCount > 0 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">+{extraCount}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Starting at</p>
            <p className="text-base font-extrabold text-slate-900">{formatRate(worker.price, worker.pricing_type)}</p>
          </div>
          <div className="text-right">
            <StarRating value={worker.avg_rating} />
            <p className="mt-1 text-xs text-slate-500">
              {worker.review_count > 0 ? `${worker.avg_rating.toFixed(1)} · ${worker.review_count} reviews` : 'No reviews yet'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{location || 'Location not set'}</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-brand-700 transition group-hover:gap-2">
            View profile <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
