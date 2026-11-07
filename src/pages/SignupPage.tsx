import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Briefcase, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { inputClass, labelClass } from '@/lib/styles';
import type { Role } from '@/lib/types';
import { AuthError, AuthShell, AuthSubmitButton, PasswordField, homeForRole } from '@/components/auth/AuthShell';

type SignupRole = Exclude<Role, 'admin'>;

const ROLE_OPTIONS: { value: SignupRole; title: string; description: string; icon: typeof UserRound }[] = [
  { value: 'customer', title: 'I need work done', description: 'Find and review professionals', icon: UserRound },
  { value: 'worker', title: 'I offer services', description: 'Build a profile and get hired', icon: Briefcase },
];

export default function SignupPage() {
  const { session, profile, loading, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole: SignupRole = searchParams.get('role') === 'worker' ? 'worker' : 'customer';
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session && profile) return <Navigate to={homeForRole(profile.role)} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    setBusy(true);
    setError(null);
    const message = await signUp({ email: email.trim(), password, fullName: fullName.trim(), role });
    setBusy(false);
    if (message) setError(message);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute. You can complete your profile afterwards."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className={labelClass}>I am joining as</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map((option) => {
              const active = role === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  aria-pressed={active}
                  className={`flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                    active ? 'border-brand-600 bg-brand-50 shadow-md shadow-brand-600/10' : 'border-slate-200 bg-white hover:border-brand-200'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold text-slate-900">{option.title}</span>
                  <span className="text-xs text-slate-500">{option.description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="signup-name" className={labelClass}>Full name</label>
          <input id="signup-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required maxLength={100} className={inputClass} />
        </div>
        <div>
          <label htmlFor="signup-email" className={labelClass}>Email</label>
          <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="signup-password" className={labelClass}>Password</label>
          <PasswordField id="signup-password" value={password} onChange={setPassword} autoComplete="new-password" />
          <p className="mt-1.5 text-xs text-slate-400">At least 6 characters.</p>
        </div>
        <AuthError message={error} />
        <AuthSubmitButton busy={busy} label="Create account" />
      </form>
    </AuthShell>
  );
}
