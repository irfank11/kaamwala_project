import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { containerClass } from '@/lib/styles';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className={`${containerClass} flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between`}>
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-white">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-extrabold text-slate-900">
              kaam<span className="text-brand-600">Wala</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm text-slate-500">
            Find dependable local professionals for every job at home, with honest reviews and transparent rates.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-slate-600">
          <Link to="/workers" className="hover:text-brand-700">Find workers</Link>
          <Link to="/signup" className="hover:text-brand-700">Become a professional</Link>
          <Link to="/login" className="hover:text-brand-700">Log in</Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} kaamWala. All rights reserved.
      </div>
    </footer>
  );
}
