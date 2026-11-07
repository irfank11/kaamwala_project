import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, XCircle, RotateCcw } from 'lucide-react';
import { fetchAllWorkersForAdmin, setWorkerApprovalStatus } from '@/services/admin';
import { cardClass, buttonPrimary, buttonSecondary, buttonDanger } from '@/lib/styles';
import { resolveIcon } from '@/lib/icons';
import type { ApprovalStatus, WorkerListing } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAsyncList } from '@/hooks/useAsyncList';
import { formatRate } from '@/lib/format';

type FilterStatus = 'all' | ApprovalStatus;

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

const STATUS_PILL: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
};

export default function AdminWorkers() {
  const { items: workers, error, loading, reload } = useAsyncList(fetchAllWorkersForAdmin);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const visible = filter === 'all' ? workers : workers.filter((worker) => worker.approval_status === filter);

  const changeStatus = async (worker: WorkerListing, status: ApprovalStatus) => {
    setBusyId(worker.id);
    setActionError(null);
    try {
      await setWorkerApprovalStatus(worker.id, status);
      reload();
    } catch {
      setActionError("We couldn't update that worker. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter workers by status">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition duration-200 ${
              filter === item.value ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-white text-slate-600 ring-1 ring-slate-900/5 hover:text-brand-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {actionError && <p role="status" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{actionError}</p>}

      {loading ? (
        <LoadingState label="Loading workers..." />
      ) : error ? (
        <ErrorState message="We couldn't load workers." onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState title="No workers here" description="Workers who sign up appear in this list for review." />
      ) : (
        <ul className="space-y-4">
          {visible.map((worker) => (
            <li key={worker.id} className={`${cardClass} flex flex-col gap-4 p-5 sm:flex-row sm:items-center`}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Avatar src={worker.profile?.avatar_url ?? null} name={worker.profile?.full_name ?? 'Worker'} size="sm" />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-slate-900">{worker.profile?.full_name ?? 'Unnamed worker'}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_PILL[worker.approval_status]}`}>
                      {worker.approval_status}
                    </span>
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {worker.city || worker.profile?.city || 'No city'} · {formatRate(worker.price, worker.pricing_type)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {worker.worker_categories.map((link) => {
                      const Icon = resolveIcon(link.category.icon);
                      return (
                        <span key={link.category.id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          <Icon className="h-3 w-3" aria-hidden="true" />
                          {link.category.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {worker.approval_status !== 'approved' && (
                  <button type="button" disabled={busyId === worker.id} onClick={() => changeStatus(worker, 'approved')} className={buttonPrimary}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </button>
                )}
                {worker.approval_status !== 'rejected' && (
                  <button type="button" disabled={busyId === worker.id} onClick={() => changeStatus(worker, 'rejected')} className={buttonDanger}>
                    <XCircle className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </button>
                )}
                {worker.approval_status !== 'pending' && (
                  <button type="button" disabled={busyId === worker.id} onClick={() => changeStatus(worker, 'pending')} className={buttonSecondary}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Only approved workers appear in search results.
      </p>
    </section>
  );
}
