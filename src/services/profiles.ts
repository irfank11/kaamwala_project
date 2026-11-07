import { supabase } from '@/lib/supabase';

export async function updateProfileDetails(
  userId: string,
  details: { full_name: string; phone: string; city: string; avatar_url: string | null },
): Promise<void> {
  const { error } = await supabase.from('profiles').update(details).eq('id', userId);
  if (error) throw error;
}
