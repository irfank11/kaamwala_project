import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CalendarClock, Clock, Images, MapPin, Star, UserRound, Wrench, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ensureWorkerProfile, fetchWorkerDetail } from '@/services/workers';
import { fetchCategories } from '@/services/categories';
import { cardClass, containerClass } from '@/lib/styles';
import type { ServiceCategory, WorkerDetail } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { ErrorState, LoadingState } from '@/components/ui/States';
import ProfileTab from '@/components/dashboard/ProfileTab';
import ServicesTab from '@/components/dashboard/ServicesTab';
import ScheduleTab from '@/components/dashboard/ScheduleTab';
import LocationTab from '@/components/dashboard/LocationTab';
import PortfolioTab from '@/components/dashboard/PortfolioTab';
import ReviewsTab from '@/components/dashboard/ReviewsTab';

type TabId = 'profile' | 'services' | 'schedule' | 'location' | 'portfolio' | 'reviews';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'schedule', label: 'Rates & hours', icon: CalendarClock },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'portfolio', label: 'Portfolio', icon: Images },
  { id: 'reviews', label: 'Reviews', icon: Star },
];

const STATUS_COPY: Record<WorkerDetail['approval_status'], { label: string; className: string }> = {
  pending: { label: 'Awaiting approval', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Live on kaamWala', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Not approved', className: 'bg-rose-100 text-rose-800' },
};

export default function WorkerDashboardPage() {
  const { session, profile } = useAuth();
  const userId = session?.user.id;
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TabId>('profile');

  const loadWorker = useCallback(async (id: string) => {
    const detail = await fetchWorkerDetail(id);
    setWorker(detail);
    return detail;
  }, []);

  const initialise = useCallback(async (id: string) => {
    setLoadError(false);
    try {
      await ensureWorkerProfile(id);
      const [detail, list] = await Promise.all([fetchWorkerDetail(id), fetchCategories()]);
      setWorker(detail);
      setCategories(list);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (userId) void initialise(userId);
  }, [userId, initialise]);

  if (!userId || !profile) return null;

  const refresh = async () => {
    try {
      await loadWorker(userId);
    } catch {
      setLoadError(true);
    }
  };

  const renderTab = (current: WorkerDetail) => {
    const props = { worker: current, onSaved: refresh };
    switch (tab) {
      case 'profile':
        return <ProfileTab {...props} />;
      case 'services':
        return <ServicesTab {...props} categories={categories} />;
      case 'schedule':
        return <ScheduleTab {...props} />;
      case 'location':
        return <LocationTab {...props} />;
      case 'portfolio':
        return <PortfolioTab {...props} />;
      case 'reviews':
        return <ReviewsTab {...props} />;
    }
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className={`${containerClass} space-y-8`}>
        {loadError && !worker && (
          <ErrorState message="We couldn't open your dashboard." onRetry={() => userId && initialise(userId)} />
        )}
        {!worker && !loadError && <LoadingState label="Opening your dashboard..." />}

        {worker && (
          <>
            <header className={`${cardClass} flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8`}>
              <Avatar src={profile.avatar_url} name={profile.full_name || 'Worker'} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-semibold text-brand-700">Worker dashboard</p>
                <h1 className="truncate text-2xl font-extrabold text-slate-900 sm:text-3xl">{profile.full_name}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COPY[worker.approval_status].className}`}>
                    {STATUS_COPY[worker.approval_status].label}
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <StarRating value={worker.avg_rating} />
                    <span className="text-xs text-slate-500">({worker.review_count})</span>
                  </span>
                </div>
              </div>
            </header>

            {worker.approval_status !== 'approved' && (
              <div
                role="status"
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                  worker.approval_status === 'pending'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {worker.approval_status === 'pending' ? (
                  <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                )}
                <p>
                  {worker.approval_status === 'pending'
                    ? 'Our team is reviewing your profile. You can keep editing it, and customers will see it once it is approved.'
                    : 'Your profile was not approved. Update your details and our team will review it again.'}
                </p>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
              <nav aria-label="Dashboard sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 lg:self-start">
                {TABS.map((item) => {
                  const active = tab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition duration-200 ${
                        active
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                          : 'bg-white text-slate-600 ring-1 ring-slate-900/5 hover:-translate-y-0.5 hover:text-brand-700 hover:shadow-md'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="min-w-0">{renderTab(worker)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
