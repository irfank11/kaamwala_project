import { supabase } from '@/lib/supabase';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function validateImageFile(file: File): string | null {
  if (!(file.type in IMAGE_EXTENSIONS)) return 'Please choose a JPG, PNG or WebP image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be 5 MB or smaller.';
  return null;
}

export async function uploadImage(userId: string, file: File, prefix: string): Promise<string> {
  const path = `${userId}/${prefix}-${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`;
  const { error } = await supabase.storage
    .from('portfolio')
    .upload(path, file, { contentType: file.type, cacheControl: '3600' });
  if (error) throw error;
  return supabase.storage.from('portfolio').getPublicUrl(path).data.publicUrl;
}
