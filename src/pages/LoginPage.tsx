import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { inputClass, labelClass } from '@/lib/styles';
import { AuthError, AuthShell, AuthSubmitButton, PasswordField, homeForRole } from '@/components/auth/AuthShell';

export default function LoginPage() {
  const { session, profile, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from;
  const target = !loading && session && profile ? (from ?? homeForRole(profile.role)) : null;

  if (target) return <Navigate to={target} replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const message = await signIn(email.trim(), password);
    setBusy(false);
    if (message) setError(message);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your reviews, your professional profile or your team."
      footer={
        <>
          New to kaamWala?{' '}
          <Link to="/signup" className="font-bold text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>Email</label>
          <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="login-password" className={labelClass}>Password</label>
          <PasswordField id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <AuthError message={error} />
        <AuthSubmitButton busy={busy} label="Log in" />
      </form>
    </AuthShell>
  );
}
