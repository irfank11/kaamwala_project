import { supabase } from '@/lib/supabase';
import type { DayKey, PricingType, WorkerDetail, WorkerListing } from '@/lib/types';

const LISTING_SELECT =
  '*, profile:profiles(full_name, phone, city, avatar_url), worker_categories(expertise, category:service_categories(id, slug, name, description, icon, is_active, sort_order))';

const DETAIL_SELECT = `${LISTING_SELECT}, portfolio_images(id, image_url, caption, created_at)`;

export interface WorkerProfileInput {
  headline: string;
  bio: string;
  years_experience: number;
  skills: string[];
  pricing_type: PricingType;
  price: number;
  city: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  working_days: DayKey[];
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export async function fetchWorkerListings(): Promise<WorkerListing[]> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select(LISTING_SELECT)
    .order('avg_rating', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as unknown as WorkerListing[];
}

export async function fetchWorkerDetail(workerId: string): Promise<WorkerDetail | null> {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select(DETAIL_SELECT)
    .eq('id', workerId)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as WorkerDetail | null) ?? null;
}

export async function ensureWorkerProfile(userId: string): Promise<void> {
  const { error } = await supabase.from('worker_profiles').upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function saveWorkerProfile(userId: string, input: Partial<WorkerProfileInput>): Promise<void> {
  const { error } = await supabase.from('worker_profiles').update(input).eq('id', userId);
  if (error) throw error;
}

export async function replaceWorkerCategories(
  userId: string,
  links: { category_id: string; expertise: string }[],
): Promise<void> {
  const { error: deleteError } = await supabase.from('worker_categories').delete().eq('worker_id', userId);
  if (deleteError) throw deleteError;
  if (links.length === 0) return;
  const { error } = await supabase
    .from('worker_categories')
    .insert(links.map((link) => ({ ...link, worker_id: userId })));
  if (error) throw error;
}

export async function addPortfolioImage(workerId: string, imageUrl: string, caption: string): Promise<void> {
  const { error } = await supabase
    .from('portfolio_images')
    .insert({ worker_id: workerId, image_url: imageUrl, caption });
  if (error) throw error;
}

export async function deletePortfolioImage(imageId: string): Promise<void> {
  const { error } = await supabase.from('portfolio_images').delete().eq('id', imageId);
  if (error) throw error;
}
