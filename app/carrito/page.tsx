import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { CartCheckout } from '@/components/CartCheckout';
import type { Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Carrito y cotización' };

export default async function CarritoPage() {
  const supabase = createClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
  const settings = data as Settings;

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">Carrito</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          <h1 className="text-xl font-bold text-text-primary">Tu carrito y cotización</h1>
          <p className="text-xs text-text-secondary">
            Completa los datos de despacho y enviaremos tu cotización directo a WhatsApp.
          </p>
        </div>

        <CartCheckout settings={settings} />
      </div>
    </div>
  );
}
