import { AVAILABILITY_LABEL, getAvailabilityState, type AvailabilityState } from '@/lib/format';
import type { WorkerListing } from '@/lib/types';

const TONE: Record<AvailabilityState, string> = {
  now: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  today: 'bg-sky-50 text-sky-700 ring-sky-200',
  off: 'bg-amber-50 text-amber-700 ring-amber-200',
  unavailable: 'bg-slate-100 text-slate-500 ring-slate-200',
};

export default function AvailabilityPill({ worker }: { worker: WorkerListing }) {
  const state = getAvailabilityState(worker);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE[state]}`}>
      <span className="relative flex h-2 w-2">
        {state === 'now' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${state === 'now' ? 'bg-emerald-500' : state === 'today' ? 'bg-sky-500' : state === 'off' ? 'bg-amber-500' : 'bg-slate-400'}`} />
      </span>
      {AVAILABILITY_LABEL[state]}
    </span>
  );
}
