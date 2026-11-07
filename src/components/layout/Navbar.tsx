import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, UserRound, Wrench, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { buttonPrimary, buttonSecondary, containerClass } from '@/lib/styles';
import { Avatar } from '@/components/ui/Avatar';

const NAV_LINKS = [
  { to: '/workers', label: 'Find Workers' },
  { to: '/#categories', label: 'Categories' },
];

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate('/');
  };

  const dashboardLink =
    profile?.role === 'worker' ? { to: '/dashboard', label: 'My Dashboard' } : profile?.role === 'admin' ? { to: '/admin', label: 'Admin' } : null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? 'bg-white/90 shadow-sm backdrop-blur-xl' : 'bg-white/70 backdrop-blur-md'
      }`}
    >
      <div className={`${containerClass} flex h-16 items-center justify-between gap-4`}>
        <Link to="/" className="group flex items-center gap-2.5" aria-label="kaamWala home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-white shadow-md shadow-brand-600/30 transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            kaam<span className="text-brand-600">Wala</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/workers'}>
              {link.label}
            </NavLink>
          ))}
          {session && dashboardLink && (
            <NavLink to={dashboardLink.to} className={linkClass}>
              {dashboardLink.label}
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link to="/account" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-slate-100">
                <Avatar src={profile?.avatar_url ?? null} name={profile?.full_name || 'You'} size="sm" />
                <span className="max-w-[9rem] truncate text-sm font-semibold text-slate-800">
                  {profile?.full_name || 'My account'}
                </span>
              </Link>
              <button type="button" onClick={handleSignOut} className={buttonSecondary}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonSecondary}>
                Log in
              </Link>
              <Link to="/signup" className={buttonPrimary}>
                Join kaamWala
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className={`${containerClass} flex flex-col gap-1 py-4`}>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            {session && dashboardLink && (
              <Link to={dashboardLink.to} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {dashboardLink.label}
              </Link>
            )}
            {session ? (
              <>
                <Link to="/account" className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  My account
                </Link>
                <button type="button" onClick={handleSignOut} className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <Link to="/login" className={buttonSecondary}>
                  Log in
                </Link>
                <Link to="/signup" className={buttonPrimary}>
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
