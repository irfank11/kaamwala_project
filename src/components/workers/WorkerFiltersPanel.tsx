import { SlidersHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { DEFAULT_FILTERS, type SortKey, type WorkerFilters } from '@/lib/workerFilters';
import { buttonSecondary, inputClass, labelClass } from '@/lib/styles';
import type { ServiceCategory } from '@/lib/types';

const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 4, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'rating', label: 'Top rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'price-asc', label: 'Lowest price' },
  { value: 'distance', label: 'Nearest first' },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

interface WorkerFiltersPanelProps {
  filters: WorkerFilters;
  categories: ServiceCategory[];
  hasLocation: boolean;
  onChange: (next: WorkerFilters) => void;
}

export default function WorkerFiltersPanel({ filters, categories, hasLocation, onChange }: WorkerFiltersPanelProps) {
  const [open, setOpen] = useState(false);
  const update = (patch: Partial<WorkerFilters>) => onChange({ ...filters, ...patch });
  const activeCount = [
    filters.categorySlug !== '',
    filters.minRating > 0,
    filters.maxPrice !== null,
    filters.availableOnly,
    filters.radiusKm !== null,
  ].filter(Boolean).length;

  return (
    <aside className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" aria-hidden="true" />
          Refine results
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{activeCount}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...DEFAULT_FILTERS, query: filters.query, sort: filters.sort })}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-full px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-expanded={open}
          >
            {open ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div className={`${open ? 'mt-5 flex' : 'hidden'} flex-col gap-6 lg:mt-5 lg:flex`}>
        <div>
          <span className={labelClass}>Service</span>
          <div className="flex flex-wrap gap-2">
            <Chip active={filters.categorySlug === ''} onClick={() => update({ categorySlug: '' })}>
              All
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                active={filters.categorySlug === category.slug}
                onClick={() => update({ categorySlug: category.slug })}
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className={labelClass}>Minimum rating</span>
          <div className="grid grid-cols-3 gap-2">
            {RATING_OPTIONS.map((option) => (
              <Chip key={option.value} active={filters.minRating === option.value} onClick={() => update({ minRating: option.value })}>
                {option.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="max-price" className={labelClass}>
            Max rate (₹)
          </label>
          <input
            id="max-price"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Any budget"
            value={filters.maxPrice ?? ''}
            onChange={(event) => {
              const raw = event.target.value;
              update({ maxPrice: raw === '' ? null : Math.max(0, Number(raw)) });
            }}
            className={inputClass}
          />
        </div>

        <div>
          <span className={labelClass}>Distance</span>
          {hasLocation ? (
            <div className="grid grid-cols-3 gap-2">
              <Chip active={filters.radiusKm === null} onClick={() => update({ radiusKm: null })}>
                Any
              </Chip>
              {RADIUS_OPTIONS.map((radius) => (
                <Chip key={radius} active={filters.radiusKm === radius} onClick={() => update({ radiusKm: radius })}>
                  {radius} km
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Share your location above to filter by distance.</p>
          )}
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">Available today only</span>
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(event) => update({ availableOnly: event.target.checked })}
            className="h-5 w-5 cursor-pointer accent-brand-600"
          />
        </label>

        <div>
          <label htmlFor="sort" className={labelClass}>
            Sort by
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value as SortKey })}
            className={inputClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} disabled={option.value === 'distance' && !hasLocation}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={() => setOpen(false)} className={`${buttonSecondary} lg:hidden`}>
          Show results
        </button>
      </div>
    </aside>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition duration-200 ${
        active
          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
          : 'bg-slate-100 text-slate-700 hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700'
      }`}
    >
      {children}
    </button>
  );
}
