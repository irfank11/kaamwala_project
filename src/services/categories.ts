import { supabase } from '@/lib/supabase';
import type { ServiceCategory } from '@/lib/types';

export async function fetchCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase
    .from('service_categories')
    .select('id, slug, name, description, icon, is_active, sort_order')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description: string;
  icon: string;
}): Promise<void> {
  const { error } = await supabase.from('service_categories').insert({ ...input, sort_order: 100 });
  if (error) throw error;
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from('service_categories').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}
