import { createClient } from '@/lib/supabase-server';
import { SettingsAdmin } from '@/components/admin/SettingsAdmin';
import type { Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  return <SettingsAdmin initial={data as Settings} />;
}
