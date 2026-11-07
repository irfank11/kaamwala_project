import { supabase } from '@/lib/supabase';
import type { ApprovalStatus, Profile, WorkerListing } from '@/lib/types';

export async function fetchAllWorkersForAdmin(): Promise<WorkerListing[]> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*, profile:profiles(full_name, phone, city, avatar_url), worker_categories(expertise, category:service_categories(id, slug, name, description, icon, is_active, sort_order))')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as WorkerListing[];
}

export async function setWorkerApprovalStatus(workerId: string, status: ApprovalStatus): Promise<void> {
  const { error } = await supabase.rpc('admin_set_worker_status', { p_worker_id: workerId, p_status: status });
  if (error) throw error;
}

export async function fetchCustomers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, city, avatar_url, created_at')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data ?? [];
}
