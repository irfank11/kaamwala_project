import type { ReactNode } from 'react';
import { useState } from 'react';
import { Eye, EyeOff, Loader2, Wrench } from 'lucide-react';
import { buttonPrimary, inputClass } from '@/lib/styles';
import type { Role } from '@/lib/types';

export function homeForRole(role: Role | undefined): string {
  if (role === 'worker') return '/dashboard';
  if (role === 'admin') return '/admin';
  return '/';
}

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-teal-800 to-slate-950" aria-hidden="true" />
        <div className="hero-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold">
            kaam<span className="text-amber-300">Wala</span>
          </span>
        </div>
        <div className="relative space-y-6">
          <div className="perspective-1000 mx-auto flex h-64 w-64 items-center justify-center">
            <div className="preserve-3d relative h-44 w-44 animate-float-3d rounded-[2.5rem] bg-gradient-to-br from-white/30 to-white/5 shadow-2xl ring-1 ring-white/30 backdrop-blur">
              <div className="absolute inset-4 rounded-[2rem] bg-white/10" />
              <Wrench className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-amber-200" aria-hidden="true" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">Every kaam deserves the right hands.</h2>
          <p className="max-w-md text-teal-50/80">Customers find trusted professionals. Professionals get discovered by people who need them.</p>
        </div>
        <p className="relative text-sm text-teal-100/70">Verified profiles · Honest reviews · Transparent rates</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          {children}
          <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function PasswordField({
  id,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
        minLength={6}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:text-slate-700"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function AuthSubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button type="submit" disabled={busy} className={`${buttonPrimary} w-full py-3`}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {busy ? 'Please wait...' : label}
    </button>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p>;
}
