import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const buttonBase =
    'inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700`}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
          className={`${buttonBase} ${
            pageNumber === page
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700'
          }`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700`}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
