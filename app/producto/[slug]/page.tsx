import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ChevronRight, Truck, ShieldCheck, MessageCircle, Tag, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ProductCard } from '@/components/ProductCard';
import { ProductGallery } from '@/components/ProductGallery';
import { AddToCartButton } from '@/components/AddToCartButton';
import { formatCLP, effectivePrice, discountPct, whatsappLink } from '@/lib/format';
import type { Product, Category, Settings } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
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

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const [{ data: prod }, { data: settings }] = await Promise.all([
    supabase.from('products').select('*, categoria:categories(*)').eq('slug', params.slug).single(),
    supabase.from('settings').select('*').eq('id', 1).single()
  ]);

  if (!prod) notFound();
  const product = prod as Product & { categoria: Category | null };
  const s = settings as Settings | null;

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
  const phone = s?.telefono_whatsapp ?? '+56957845292';

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
    <div className="bg-bg-page min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-text-secondary mb-3 flex-wrap">
          <Link href="/" className="hover:text-text-link">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/materiales" className="hover:text-text-link">Materiales</Link>
          {product.categoria && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/categoria/${product.categoria.slug}`} className="hover:text-text-link">
                {product.categoria.nombre}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-primary truncate max-w-xs">{product.nombre}</span>
        </nav>

        {/* Main product layout */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            {/* GALLERY */}
            <div className="p-6 border-r border-gray-100">
              <ProductGallery
                cover={product.imagen_url}
                gallery={product.imagenes_galeria ?? []}
                alt={product.nombre}
                fallbackChar={product.nombre.charAt(0)}
                discountBadge={desc}
              />
            </div>

            {/* INFO */}
            <div className="p-6 flex flex-col">
              {/* Tag tipo + condición */}
              <div className="flex items-center gap-2 text-2xs text-text-secondary mb-1">
                <span className="uppercase tracking-wide">Nuevo</span>
                {product.sku && (
                  <>
                    <span>·</span>
                    <span>SKU {product.sku}</span>
                  </>
                )}
              </div>

              {/* Título */}
              <h1 className="text-2xl font-semibold text-text-primary leading-tight mb-3">
                {product.nombre}
              </h1>

              {/* Precio bloque */}
              <div className="mb-5">
                {desc > 0 && (
                  <span className="price-old text-base">{formatCLP(product.precio)}</span>
                )}
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-4xl font-light text-text-primary">{formatCLP(price)}</span>
                  {desc > 0 && <span className="tag-discount text-lg">{desc}% OFF</span>}
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Precio por <strong>{product.unidad}</strong> · IVA incluido
                </p>
              </div>

              {/* Características rápidas */}
              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2 text-sm text-text-primary">
                  <Truck className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-success">Despacho a tu comuna</strong>
                    <p className="text-2xs text-text-secondary">Se confirma costo según volumen.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-text-primary">
                  <Package className="w-4 h-4 text-text-link mt-0.5 shrink-0" />
                  <div>
                    <strong>Stock: <span className="capitalize">{product.stock_estado.replace('_', ' ')}</span></strong>
                    <p className="text-2xs text-text-secondary">Confirma disponibilidad al cotizar.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-text-primary">
                  <ShieldCheck className="w-4 h-4 text-text-link mt-0.5 shrink-0" />
                  <div>
                    <strong>Compra segura</strong>
                    <p className="text-2xs text-text-secondary">Boleta o factura electrónica.</p>
                  </div>
                </li>
              </ul>

              {/* CTA */}
              <div className="space-y-2 mt-auto">
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
                <a
                  href={whatsappLink(phone, `Hola, quiero cotizar: ${product.nombre} (${product.sku ?? ''})`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa w-full"
                >
                  <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Descripción larga */}
          {product.descripcion && (
            <div className="border-t border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-3">Descripción</h2>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line">
                {product.descripcion}
              </p>
            </div>
          )}
        </div>

        {/* Relacionados */}
        {similares && similares.length > 0 && (
          <section className="mt-4 bg-white rounded-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-text-primary">También te puede interesar</h2>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {(similares as Product[]).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
