import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { AridosCalculator } from '@/components/AridosCalculator';
import type { Product } from '@/lib/types';

export const revalidate = 60;
export const metadata = { title: 'Áridos' };

export default async function AridosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('activo', true)
    .eq('tipo', 'arido')
    .order('nombre');
  const aridos = (data ?? []) as Product[];

  return (
    <>
      <section className="bg-navy text-sand py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grit opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4">
          <span className="font-display uppercase text-xs tracking-widest text-ember">
            Materiales por volumen
          </span>
          <h1 className="font-display uppercase text-4xl md:text-5xl mt-1 mb-3">
            Áridos
          </h1>
          <p className="max-w-2xl text-sand/80">
            Arena, gravilla, ripio, bolón, maicillo y estabilizado. Pedido mínimo 1 m³.
            Despacho a confirmar según comuna.
          </p>
        </div>
      </section>

      {/* CALCULADORA — parte superior, full-width contenida */}
      <section className="max-w-3xl mx-auto px-4 -mt-8 mb-12 relative z-10">
        <AridosCalculator aridos={aridos} />
      </section>

      {/* LISTADO COMPLETO */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="font-display uppercase text-2xl text-navy mb-5">
          Tipos disponibles
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {aridos.map((a) => (
            <ProductCard key={a.id} product={a} />
          ))}
        </div>
      </section>
    </>
  );
}
