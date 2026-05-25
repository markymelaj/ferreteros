'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export function SignOutButton() {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-2 py-1.5 text-xs font-display uppercase tracking-wider text-sand/80 hover:text-ember w-full"
    >
      <LogOut className="w-3 h-3" /> Salir
    </button>
  );
}
