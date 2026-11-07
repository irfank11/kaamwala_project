import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { buttonSecondary } from '@/lib/styles';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm font-semibold text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-rose-700">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={buttonSecondary}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Inbox className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action}
    </div>
  );
}
