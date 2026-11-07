import { Star } from 'lucide-react';

export function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const filled = Math.round(value);
  const iconClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconClass} ${star <= filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
