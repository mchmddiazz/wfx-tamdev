import { supabase } from './supabase';

export type StorageFolder =
  | 'projects'
  | 'profile'
  | 'resume'
  | 'logos'
  | 'certificates';

export async function uploadPortfolioFile(
  file: File,
  folder: StorageFolder
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('portfolio-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('portfolio-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}