import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocateFixed, Search, SearchX } from 'lucide-react';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { fetchCategories } from '@/services/categories';
import { fetchWorkerListings } from '@/services/workers';
import { DEFAULT_FILTERS, rankWorkers, type SortKey, type WorkerFilters } from '@/lib/workerFilters';
import { buttonPrimary, containerClass, inputClass } from '@/lib/styles';
import type { ServiceCategory, WorkerListing } from '@/lib/types';
import WorkerCard from '@/components/workers/WorkerCard';
import WorkerFiltersPanel from '@/components/workers/WorkerFiltersPanel';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

const PAGE_SIZE = 9;
const SORT_KEYS: SortKey[] = ['rating', 'reviews', 'price-asc', 'distance'];

function filtersFromParams(params: URLSearchParams): WorkerFilters {
  const sort = params.get('sort') as SortKey | null;
  return {
    ...DEFAULT_FILTERS,
    query: params.get('q') ?? '',
    categorySlug: params.get('category') ?? '',
    sort: sort && SORT_KEYS.includes(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

export default function WorkersPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<WorkerFilters>(() => filtersFromParams(searchParams));
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [workers, setWorkers] = useState<WorkerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useCurrentLocation();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryRows, workerRows] = await Promise.all([fetchCategories(), fetchWorkerListings()]);
      setCategories(categoryRows.filter((category) => category.is_active));
      setWorkers(workerRows);
    } catch {
      setError("We couldn't load professionals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const effectiveFilters = useMemo<WorkerFilters>(
    () => (filters.sort === 'distance' && !location.coords ? { ...filters, sort: 'rating' } : filters),
    [filters, location.coords],
  );

  const results = useMemo(
    () => rankWorkers(workers, effectiveFilters, location.coords),
    [workers, effectiveFilters, location.coords],
  );

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const changeFilters = (next: WorkerFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className={`${containerClass} flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between`}>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Find professionals</p>
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Skilled workers near you</h1>
            <p className="text-sm text-slate-500">Compare ratings, rates and availability, then call or WhatsApp directly.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <label className="relative flex-1 md:w-80">
              <span className="sr-only">Search professionals</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={filters.query}
                onChange={(event) => changeFilters({ ...filters, query: event.target.value })}
                placeholder="Search name, skill or area"
                className={`${inputClass} pl-11`}
              />
            </label>
            {!location.coords && (
              <button type="button" onClick={location.request} disabled={location.status === 'locating'} className={buttonPrimary}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                {location.status === 'locating' ? 'Locating...' : 'Near me'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className={`${containerClass} grid gap-8 py-10 lg:grid-cols-[18rem_1fr]`}>
        <WorkerFiltersPanel
          filters={effectiveFilters}
          categories={categories}
          hasLocation={location.coords !== null}
          onChange={changeFilters}
        />

        <section className="min-w-0">
          {loading ? (
            <LoadingState label="Finding professionals..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  {results.length === 0 ? 'No matches' : `${results.length} professional${results.length === 1 ? '' : 's'} found`}
                </p>
                {location.status === 'denied' && (
                  <p className="text-xs text-slate-500">Location access is off, so distance sorting is unavailable.</p>
                )}
              </div>

              {results.length === 0 ? (
                <EmptyState
                  title="No professionals match these filters"
                  description="Try widening your budget, lowering the rating requirement, or clearing a filter."
                  action={
                    <button type="button" onClick={() => changeFilters({ ...DEFAULT_FILTERS, sort: filters.sort })} className={buttonPrimary}>
                      <SearchX className="h-4 w-4" aria-hidden="true" />
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {pageItems.map(({ worker, distance }) => (
                      <WorkerCard key={worker.id} worker={worker} distance={distance} />
                    ))}
                  </div>
                  <div className="mt-12">
                    <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
