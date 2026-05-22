import { createClient } from '@/lib/supabase-server';
import { MaquinariaAdmin } from '@/components/admin/MaquinariaAdmin';
import type { Maquinaria } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminMaquinariaPage() {
  const supabase = createClient();
  const { data } = await supabase.from('maquinaria').select('*').order('nombre');
  return <MaquinariaAdmin initial={(data ?? []) as Maquinaria[]} />;
}
