import { supabase } from '@/lib/supabase';
import type { AdminReview, Profile, Review } from '@/lib/types';

const REVIEW_COLUMNS = 'id, worker_id, customer_id, author_name, rating, comment, created_at';

export async function fetchWorkerReviews(workerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_COLUMNS)
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function submitReview(workerId: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase.from('reviews').insert({ worker_id: workerId, rating, comment });
  if (error) throw error;
}

export async function updateReview(reviewId: string, rating: number, comment: string): Promise<void> {
  const { error } = await supabase.from('reviews').update({ rating, comment }).eq('id', reviewId);
  if (error) throw error;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw error;
}

export async function fetchAllReviews(): Promise<AdminReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`${REVIEW_COLUMNS}, worker:worker_profiles(profile:profiles(full_name))`)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as unknown as AdminReview[];
}
