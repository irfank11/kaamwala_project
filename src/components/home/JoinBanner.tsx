import { Briefcase, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buttonPrimary, buttonSecondary, containerClass } from '@/lib/styles';

export default function JoinBanner() {
  return (
    <section className={`${containerClass} py-16 sm:py-20`}>
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-teal-700 to-cyan-900 px-6 py-12 text-white shadow-2xl shadow-brand-900/30 sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              For skilled professionals
            </span>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">Turn your skills into steady work</h2>
            <p className="max-w-lg text-base text-teal-50/90">
              Create your professional profile, show your best work, set your own rates and hours. Customers near you will find you.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/signup?role=worker" className={`${buttonPrimary} bg-white !text-teal-800 shadow-none hover:bg-teal-50`}>
                Register as a worker
              </Link>
              <Link to="/workers" className={`${buttonSecondary} border-white/30 bg-transparent !text-white hover:bg-white/10`}>
                Browse professionals
              </Link>
            </div>
          </div>
          <ul className="grid gap-3">
            {['Set hourly, daily or fixed rates', 'Showcase portfolio photos', 'Control your working days and hours'].map((item) => (
              <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur transition hover:translate-x-1 hover:bg-white/15">
                <Star className="h-5 w-5 shrink-0 fill-amber-300 text-amber-300" aria-hidden="true" />
                <span className="font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
