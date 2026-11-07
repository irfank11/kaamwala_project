import { fetchCustomers } from '@/services/admin';
import { cardClass } from '@/lib/styles';
import { formatJoinDate } from '@/lib/format';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useAsyncList } from '@/hooks/useAsyncList';

export default function AdminCustomers() {
  const { items: customers, loading, error, reload } = useAsyncList(fetchCustomers);

  if (loading) return <LoadingState label="Loading customers..." />;
  if (error) return <ErrorState message="We couldn't load customers." onRetry={reload} />;
  if (customers.length === 0) return <EmptyState title="No customers yet" description="Customers who sign up appear in this list." />;

  return (
    <div className={`${cardClass} overflow-hidden`}>
      <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr] gap-4 border-b border-slate-100 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400 md:grid">
        <span>Name</span>
        <span>Phone</span>
        <span>City</span>
        <span>Joined</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {customers.map((customer) => (
          <li key={customer.id} className="grid gap-2 px-6 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[2fr_1.5fr_1fr_1fr] md:items-center md:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar src={customer.avatar_url} name={customer.full_name || 'Customer'} size="sm" />
              <span className="truncate font-bold text-slate-900">{customer.full_name || 'Unnamed customer'}</span>
            </div>
            <span className="text-sm text-slate-600">{customer.phone || '-'}</span>
            <span className="text-sm text-slate-600">{customer.city || '-'}</span>
            <span className="text-sm text-slate-500">{formatJoinDate(customer.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
