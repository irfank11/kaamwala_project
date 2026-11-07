import { useState, type FormEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { buttonPrimary } from '@/lib/styles';
import type { ServiceCategory } from '@/lib/types';
import { containerClass } from '@/lib/styles';

export default function HeroSection({ categories }: { categories: ServiceCategory[] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (categorySlug) params.set('category', categorySlug);
    navigate(`/workers${params.toString() ? `?${params}` : ''}`);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 10}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * 14}deg`);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/7480715/pexels-photo-7480715.jpeg?auto=compress&cs=tinysrgb&h=650&w=1400')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-teal-900/70" aria-hidden="true" />
      <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" aria-hidden="true" />

      <div className={`${containerClass} relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28`}>
        <div className="animate-fade-up space-y-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            Trusted local professionals, reviewed by real customers
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            The right hands for <span className="bg-gradient-to-r from-brand-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">every kaam</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Find carpenters, electricians, plumbers, painters and more near you. Compare rates, see real work, and call or WhatsApp in one tap.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-2xl shadow-black/30 ring-1 ring-white/10 sm:flex-row sm:items-center"
            role="search"
          >
            <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2.5">
              <Search className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="sr-only">Search by name, skill or area</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search skill, name or area"
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" aria-hidden="true" />
            <label className="sm:w-48">
              <span className="sr-only">Service category</span>
              <select
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                className="w-full rounded-2xl bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none"
              >
                <option value="">All services</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={`${buttonPrimary} justify-center px-7 py-3`}>
              Search
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <span>Transparent rates</span>
            <span>Verified profiles</span>
            <span>Direct calls and WhatsApp</span>
          </div>
        </div>

        <div className="perspective-1000 relative hidden h-[460px] lg:block" onMouseMove={handleMouseMove} onMouseLeave={(event) => {
          event.currentTarget.style.setProperty('--tilt-x', '0deg');
          event.currentTarget.style.setProperty('--tilt-y', '0deg');
        }}>
          <div
            className="preserve-3d absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))' }}
          >
            <FloatingCard className="left-4 top-6 w-64 animate-float-3d" title="Carpenter" subtitle="Furniture, doors and wardrobes" badge="Available now" tone="from-brand-500 to-teal-700" initials="CP" />
            <FloatingCard className="right-0 top-40 w-64 animate-float-3d [animation-delay:-2.5s]" title="Electrician" subtitle="Wiring, fittings and repairs" badge="Same day" tone="from-amber-400 to-orange-500" initials="EL" />
            <FloatingCard className="bottom-4 left-20 w-64 animate-float-3d [animation-delay:-4.5s]" title="Plumber" subtitle="Leaks, pipes and bathroom fittings" badge="24x7 help" tone="from-cyan-500 to-sky-700" initials="PL" />
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-white/20" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  title,
  subtitle,
  badge,
  tone,
  initials,
}: {
  className: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: string;
  initials: string;
}) {
  return (
    <div className={`absolute rounded-3xl bg-white/95 p-4 shadow-2xl shadow-black/40 ring-1 ring-white/20 backdrop-blur ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-base font-extrabold text-white`}>
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">● {badge}</span>
      </div>
    </div>
  );
}
