import { MessageCircle, Phone } from 'lucide-react';
import { contactDigits } from '@/lib/format';
import { buttonPrimary, buttonSecondary, cardClass } from '@/lib/styles';
import type { WorkerDetail } from '@/lib/types';
import { formatRate, formatTime, DAYS } from '@/lib/format';
import AvailabilityPill from '@/components/workers/AvailabilityPill';

export default function ContactPanel({ worker }: { worker: WorkerDetail }) {
  const phone = worker.profile?.phone?.trim() ?? '';
  const digits = contactDigits(phone);
  const hasPhone = digits.length >= 10;

  return (
    <div className={`${cardClass} space-y-6 p-6`}>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Starting rate</p>
        <p className="text-3xl font-extrabold text-slate-900">{formatRate(worker.price, worker.pricing_type)}</p>
        <AvailabilityPill worker={worker} />
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-6">
        {hasPhone ? (
          <>
            <a href={`tel:+${digits}`} className={`${buttonPrimary} w-full`}>
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {phone}
            </a>
            <a
              href={`https://wa.me/${digits}?text=${encodeURIComponent('Hi, I found you on kaamWala and need help with a job.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonSecondary} w-full !border-emerald-200 !text-emerald-700 hover:!bg-emerald-50`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Message on WhatsApp
            </a>
          </>
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">This professional has not shared a phone number yet.</p>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-6">
        <p className="text-sm font-bold text-slate-900">Working hours</p>
        <WeeklySchedule worker={worker} />
      </div>
    </div>
  );
}

function WeeklySchedule({ worker }: { worker: WorkerDetail }) {
  const hours = `${formatTime(worker.start_time)} – ${formatTime(worker.end_time)}`;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {DAYS.map((day) => {
          const active = worker.working_days.includes(day.key);
          return (
            <span
              key={day.key}
              className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold ${
                active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {day.label}
            </span>
          );
        })}
      </div>
      <p className="text-sm text-slate-600">{worker.working_days.length > 0 ? hours : 'Working days not set yet'}</p>
    </div>
  );
}
