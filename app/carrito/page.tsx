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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <span className="font-display uppercase text-xs tracking-widest text-ember">
          Tu pedido
        </span>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-navy">
          Carrito y cotización
        </h1>
        <p className="text-navy/70 mt-2 max-w-2xl">
          Completa los datos de despacho y genera tu cotización. La enviarás
          al WhatsApp de la ferretería y también podrás descargarla en PDF.
        </p>
      </header>
      <CartCheckout settings={settings} />
    </div>
  );
}
