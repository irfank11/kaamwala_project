import { useState } from 'react';
import { ClipboardCheck, Layers, MessageSquareText, Users, type LucideIcon } from 'lucide-react';
import { containerClass } from '@/lib/styles';
import AdminWorkers from '@/components/admin/AdminWorkers';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminCustomers from '@/components/admin/AdminCustomers';

type AdminTab = 'workers' | 'categories' | 'reviews' | 'customers';

const TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: 'workers', label: 'Workers', icon: ClipboardCheck },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
  { id: 'customers', label: 'Customers', icon: Users },
];

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('workers');

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className={`${containerClass} space-y-8`}>
        <header className="space-y-2">
          <p className="text-sm font-semibold text-brand-700">Admin</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Marketplace overview</h1>
          <p className="text-sm text-slate-500">Approve professionals, shape categories and keep reviews honest.</p>
        </header>

        <nav aria-label="Admin sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {TABS.map((item) => {
            const active = tab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition duration-200 ${
                  active
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'bg-white text-slate-600 ring-1 ring-slate-900/5 hover:-translate-y-0.5 hover:text-brand-700 hover:shadow-md'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === 'workers' && <AdminWorkers />}
        {tab === 'categories' && <AdminCategories />}
        {tab === 'reviews' && <AdminReviews />}
        {tab === 'customers' && <AdminCustomers />}
      </div>
    </div>
  );
}
