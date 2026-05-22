import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { CategoryGrid } from '@/components/CategoryGrid';
import type { Product, Category } from '@/lib/types';

export const revalidate = 60;

export const metadata = { title: 'Materiales' };

export default async function CatalogoPage() {
  const supabase = createClient();
  const [{ data: prods }, { data: cats }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('activo', true)
      .eq('tipo', 'producto')
      .order('nombre'),
    supabase.from('categories').select('*').eq('activo', true).order('orden')
  ]);

  const products = (prods ?? []) as Product[];
  const categorias = (cats ?? []) as Category[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <span className="font-display uppercase text-xs tracking-widest text-ember">
          Tienda
        </span>
        <h1 className="font-display uppercase text-4xl md:text-5xl text-navy">
          Materiales
        </h1>
        <p className="text-navy/70 mt-2 max-w-2xl">
          {products.length} productos disponibles. Agrega al carrito para cotizar
          por WhatsApp.
        </p>
      </header>

      <div className="mb-10">
        <CategoryGrid categories={categorias} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
