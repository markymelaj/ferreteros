import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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
    <div className="bg-bg-page min-h-screen">
      <div className="container-page py-4">
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary">Áridos</span>
        </nav>

        <div className="bg-white rounded-card shadow-card px-4 py-3 mb-4">
          <div className="text-2xs uppercase tracking-widest text-text-secondary">Materiales por volumen</div>
          <h1 className="text-xl font-bold text-text-primary">Áridos</h1>
          <p className="text-xs text-text-secondary mt-1">
            Arena, gravilla, ripio, bolón, maicillo y estabilizado. Pedido mínimo 1 m³.
          </p>
        </div>

        {/* Calculadora arriba */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-4 mb-4">
          <div className="bg-white rounded-card shadow-card p-4 flex flex-col justify-center">
            <h2 className="text-lg font-semibold text-text-primary mb-2">¿Cuántos m³ necesitas?</h2>
            <p className="text-sm text-text-secondary mb-3">
              Ingresa las dimensiones de tu obra y la calculadora te dirá el volumen
              exacto y el costo estimado. Puedes agregar el resultado al carrito directo.
            </p>
            <ul className="text-2xs text-text-secondary space-y-1">
              <li>• Largo × Ancho × Profundidad = m³</li>
              <li>• Mínimo 1 m³ por pedido</li>
              <li>• Despacho a confirmar según comuna y volumen</li>
            </ul>
          </div>
          <AridosCalculator aridos={aridos} />
        </div>

        {/* Listado completo */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-text-primary">Tipos disponibles</h2>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {aridos.map((a) => (
              <ProductCard key={a.id} product={a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
