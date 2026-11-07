import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { fetchCategories } from '@/services/categories';
import { fetchWorkerListings } from '@/services/workers';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { DEFAULT_FILTERS, rankWorkers } from '@/lib/workerFilters';
import { containerClass, buttonPrimary } from '@/lib/styles';
import type { ServiceCategory, WorkerListing } from '@/lib/types';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import SectionHeader from '@/components/home/SectionHeader';
import JoinBanner from '@/components/home/JoinBanner';
import WorkerCard from '@/components/workers/WorkerCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';

export default function HomePage() {
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
      setError("We couldn't load professionals right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const nearby = useMemo(
    () => (location.coords ? rankWorkers(workers, { ...DEFAULT_FILTERS, sort: 'distance' }, location.coords).slice(0, 6) : []),
    [workers, location.coords],
  );

  const topRated = useMemo(
    () => rankWorkers(workers, DEFAULT_FILTERS, null).slice(0, 6),
    [workers],
  );

  return (
    <div>
      <HeroSection categories={categories} />

      <section id="categories" className={`${containerClass} scroll-mt-20 py-16 sm:py-20`}>
        <SectionHeader
          eyebrow="Popular services"
          title="What do you need done?"
          description="Pick a service to see professionals who do it near you."
        />
        <div className="mt-10">
          {loading ? <LoadingState label="Loading services..." /> : <CategoryGrid categories={categories} />}
        </div>
      </section>

      <section className={`${containerClass} pb-16 sm:pb-20`}>
        <SectionHeader
          eyebrow="Close to you"
          title="Nearby professionals"
          description="Sorted by how far they are from your current location."
          action={
            location.coords ? null : (
              <button type="button" onClick={location.request} disabled={location.status === 'locating'} className={buttonPrimary}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
                {location.status === 'locating' ? 'Locating...' : 'Use my location'}
              </button>
            )
          }
        />
        <div className="mt-10">
          {loading ? (
            <LoadingState label="Finding workers..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : !location.coords ? (
            <EmptyState
              title={location.status === 'denied' ? 'Location access is off' : 'Turn on location to see who is close'}
              description={
                location.status === 'denied'
                  ? 'Allow location access in your browser settings, or browse all professionals instead.'
                  : 'We use your location only to sort professionals by distance.'
              }
            />
          ) : nearby.length === 0 ? (
            <EmptyState title="No professionals nearby yet" description="Browse all professionals to see who is available across the city." />
          ) : (
            <WorkerGridRow>
              {nearby.map(({ worker, distance }) => (
                <WorkerCard key={worker.id} worker={worker} distance={distance} />
              ))}
            </WorkerGridRow>
          )}
        </div>
        {location.coords && (
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Distances are measured from your current location.
          </p>
        )}
      </section>

      <section className={`${containerClass} pb-16 sm:pb-20`}>
        <SectionHeader
          eyebrow="Highest rated"
          title="Top-rated professionals"
          description="Trusted by customers for quality work and honest pricing."
          actionTo="/workers?sort=rating"
          actionLabel="See all professionals"
        />
        <div className="mt-10">
          {loading ? (
            <LoadingState label="Loading professionals..." />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : topRated.length === 0 ? (
            <EmptyState
              title="Our first professionals are joining soon"
              description="Profiles appear here once they have been reviewed and approved by our team."
            />
          ) : (
            <WorkerGridRow>
              {topRated.map(({ worker, distance }) => (
                <WorkerCard key={worker.id} worker={worker} distance={distance} />
              ))}
            </WorkerGridRow>
          )}
        </div>
      </section>

      <JoinBanner />
    </div>
  );
}

function WorkerGridRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}
