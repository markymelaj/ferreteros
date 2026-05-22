import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Tag, Package, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { AddToCartButton } from '@/components/AddToCartButton';
import { formatCLP, effectivePrice, discountPct } from '@/lib/format';
import type { Product, Category } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('nombre, descripcion')
    .eq('slug', params.slug)
    .single();
  return {
    title: data?.nombre ?? 'Producto',
    description: data?.descripcion ?? undefined
  };
}

export default async function ProductoPage({
  params
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: prod } = await supabase
    .from('products')
    .select('*, categoria:categories(*)')
    .eq('slug', params.slug)
    .single();

  if (!prod) notFound();
  const product = prod as Product & { categoria: Category | null };

  const { data: similares } = await supabase
    .from('products')
    .select('*')
    .eq('activo', true)
    .eq('categoria_id', product.categoria_id)
    .eq('tipo', 'producto')
    .neq('id', product.id)
    .limit(4);

  const price = effectivePrice(product.precio, product.precio_oferta);
  const desc = discountPct(product.precio, product.precio_oferta);

  const availabilityMap: Record<string, string> = {
    disponible: 'https://schema.org/InStock',
    bajo_stock: 'https://schema.org/LimitedAvailability',
    sin_stock: 'https://schema.org/OutOfStock',
    consultar: 'https://schema.org/PreOrder'
  };

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion ?? `${product.nombre} disponible en Nexo Sur.`,
    sku: product.sku ?? undefined,
    image: product.imagen_url ? [product.imagen_url] : undefined,
    category: product.categoria?.nombre,
    brand: { '@type': 'Brand', name: 'Nexo Sur' },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/producto/${product.slug}`,
      priceCurrency: 'CLP',
      price: price,
      availability: availabilityMap[product.stock_estado] ?? 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Nexo Sur' }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex items-center gap-1 text-xs uppercase font-display tracking-wider text-navy/60 mb-6 flex-wrap">
        <Link href="/" className="hover:text-ember">Inicio</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/materiales" className="hover:text-ember">Materiales</Link>
        {product.categoria && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/categoria/${product.categoria.slug}`}
              className="hover:text-ember"
            >
              {product.categoria.nombre}
            </Link>
          </>
        )}
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        <div className="aspect-square bg-white border-2 border-navy relative overflow-hidden">
          {product.imagen_url ? (
            <Image
              src={product.imagen_url}
              alt={product.nombre}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-navy/15 text-[12rem] select-none">
              {product.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          {desc > 0 && (
            <span className="absolute top-4 left-4 bg-ember text-navy font-display uppercase text-sm tracking-wider px-3 py-1 border-2 border-navy rotate-[-4deg]">
              -{desc}% OFF
            </span>
          )}
        </div>

        <div>
          {product.sku && (
            <span className="font-display uppercase text-xs tracking-widest text-navy/60">
              SKU {product.sku}
            </span>
          )}
          <h1 className="font-display uppercase text-3xl md:text-4xl text-navy leading-tight mb-3">
            {product.nombre}
          </h1>

          {desc > 0 && (
            <p className="text-navy/50 line-through text-base">
              {formatCLP(product.precio)}
            </p>
          )}
          <p className="font-display text-5xl text-ember leading-none mb-1">
            {formatCLP(price)}
          </p>
          <p className="text-sm uppercase font-display tracking-wider text-navy/60 mb-6">
            precio por {product.unidad} · IVA incluido
          </p>

          {product.descripcion && (
            <p className="text-navy/80 leading-relaxed mb-6">
              {product.descripcion}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            <span className="flex items-center gap-1.5 bg-white border-2 border-navy px-2 py-1">
              <Package className="w-4 h-4 text-ember" />
              Unidad: <strong className="font-semibold">{product.unidad}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-navy px-2 py-1">
              <Tag className="w-4 h-4 text-ember" />
              Estado: <strong className="font-semibold capitalize">{product.stock_estado.replace('_', ' ')}</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-navy px-2 py-1">
              <Truck className="w-4 h-4 text-ember" />
              Despacho local
            </span>
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              nombre: product.nombre,
              precio: price,
              unidad: product.unidad,
              imagen_url: product.imagen_url,
              tipo: product.tipo
            }}
            disabled={product.stock_estado === 'sin_stock'}
          />
        </div>
      </div>

      {similares && similares.length > 0 && (
        <section>
          <h2 className="font-display uppercase text-2xl text-navy mb-5">
            También te puede servir
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(similares as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
