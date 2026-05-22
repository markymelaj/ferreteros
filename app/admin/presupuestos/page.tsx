import { createClient } from '@/lib/supabase-server';
import { PresupuestosAdmin } from '@/components/admin/PresupuestosAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminPresupuestosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('presupuestos')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(200);
  return <PresupuestosAdmin initial={(data ?? []) as any[]} />;
}
