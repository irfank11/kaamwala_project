import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { sectionTitleClass } from '@/lib/styles';

export default function SectionHeader({
  eyebrow,
  title,
  description,
  actionTo,
  actionLabel,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionTo?: string;
  actionLabel?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>}
        <h2 className={sectionTitleClass}>{title}</h2>
        {description && <p className="max-w-xl text-sm text-slate-500 sm:text-base">{description}</p>}
      </div>
      {action ??
        (actionTo && actionLabel && (
          <Link to={actionTo} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 transition hover:gap-2.5">
            {actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ))}
    </div>
  );
}
