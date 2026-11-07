import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
