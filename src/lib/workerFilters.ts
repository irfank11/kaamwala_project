import type { Coordinates } from '@/hooks/useCurrentLocation';
import { distanceKm, getAvailabilityState } from '@/lib/format';
import type { WorkerListing } from '@/lib/types';

export type SortKey = 'rating' | 'price-asc' | 'reviews' | 'distance';

export interface WorkerFilters {
  query: string;
  categorySlug: string;
  minRating: number;
  maxPrice: number | null;
  availableOnly: boolean;
  radiusKm: number | null;
  sort: SortKey;
}

export const DEFAULT_FILTERS: WorkerFilters = {
  query: '',
  categorySlug: '',
  minRating: 0,
  maxPrice: null,
  availableOnly: false,
  radiusKm: null,
  sort: 'rating',
};

export interface RankedWorker {
  worker: WorkerListing;
  distance: number | null;
}

function matchesQuery(worker: WorkerListing, query: string): boolean {
  if (!query) return true;
  const haystack = [
    worker.profile?.full_name,
    worker.headline,
    worker.area,
    worker.city,
    worker.skills.join(' '),
    worker.worker_categories.map((link) => `${link.category.name} ${link.expertise}`).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function rankWorkers(
  workers: WorkerListing[],
  filters: WorkerFilters,
  origin: Coordinates | null,
): RankedWorker[] {
  const query = filters.query.trim();

  const ranked: RankedWorker[] = [];
  for (const worker of workers) {
    if (worker.approval_status !== 'approved') continue;
    if (filters.categorySlug && !worker.worker_categories.some((link) => link.category.slug === filters.categorySlug)) continue;
    if (!matchesQuery(worker, query)) continue;
    if (worker.avg_rating < filters.minRating) continue;
    if (filters.maxPrice !== null && worker.price > filters.maxPrice) continue;
    if (filters.availableOnly && !['now', 'today'].includes(getAvailabilityState(worker))) continue;

    let distance: number | null = null;
    if (origin && worker.latitude !== null && worker.longitude !== null) {
      distance = distanceKm(origin.latitude, origin.longitude, worker.latitude, worker.longitude);
    }
    if (filters.radiusKm !== null) {
      if (distance === null || distance > filters.radiusKm) continue;
    }
    ranked.push({ worker, distance });
  }

  ranked.sort((a, b) => {
    switch (filters.sort) {
      case 'price-asc':
        return a.worker.price - b.worker.price;
      case 'reviews':
        return b.worker.review_count - a.worker.review_count || b.worker.avg_rating - a.worker.avg_rating;
      case 'distance':
        if (a.distance === null && b.distance === null) return b.worker.avg_rating - a.worker.avg_rating;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      case 'rating':
      default:
        return b.worker.avg_rating - a.worker.avg_rating || b.worker.review_count - a.worker.review_count;
    }
  });

  return ranked;
}
