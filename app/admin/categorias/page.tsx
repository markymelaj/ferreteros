import { createClient } from '@/lib/supabase-server';
import { CategoriesAdmin } from '@/components/admin/CategoriesAdmin';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriasPage() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*').order('orden');
  return <CategoriesAdmin initial={(data ?? []) as Category[]} />;
}
