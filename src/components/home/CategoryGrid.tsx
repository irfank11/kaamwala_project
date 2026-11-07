import { Link } from 'react-router-dom';
import { useTilt } from '@/hooks/useTilt';
import { resolveIcon } from '@/lib/icons';
import type { ServiceCategory } from '@/lib/types';

const PALETTE = [
  'from-brand-500 to-teal-700',
  'from-amber-400 to-orange-500',
  'from-sky-500 to-blue-700',
  'from-rose-400 to-pink-600',
  'from-emerald-500 to-green-700',
  'from-yellow-400 to-amber-600',
  'from-slate-500 to-slate-800',
  'from-cyan-500 to-teal-600',
];

export default function CategoryGrid({ categories }: { categories: ServiceCategory[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {categories.map((category, index) => (
        <CategoryTile key={category.id} category={category} tone={PALETTE[index % PALETTE.length]} />
      ))}
    </div>
  );
}

function CategoryTile({ category, tone }: { category: ServiceCategory; tone: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>(12);
  const Icon = resolveIcon(category.icon);
  return (
    <Link
      ref={ref}
      to={`/workers?category=${category.slug}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/5 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 [transform-style:preserve-3d]"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg transition duration-500 group-hover:[transform:rotateY(180deg)_translateZ(12px)]`}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-slate-900">{category.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{category.description}</p>
      </div>
      <span className="text-xs font-semibold text-brand-700 opacity-0 transition duration-300 group-hover:opacity-100">
        Find {category.name.toLowerCase()}s →
      </span>
    </Link>
  );
}
