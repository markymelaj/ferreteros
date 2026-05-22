'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatCLP, effectivePrice, discountPct } from '@/lib/format';
import type { Product } from '@/lib/types';

const STOCK_LABELS: Record<string, { label: string; classes: string }> = {
  disponible:  { label: 'Disponible',  classes: 'bg-whatsapp/20 text-navy' },
  bajo_stock:  { label: 'Bajo stock',  classes: 'bg-ember/30 text-navy' },
  sin_stock:   { label: 'Sin stock',   classes: 'bg-red-200 text-red-900' },
  consultar:   { label: 'Consultar',   classes: 'bg-navy/10 text-navy' }
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const price = effectivePrice(product.precio, product.precio_oferta);
  const desc = discountPct(product.precio, product.precio_oferta);
  const stock = STOCK_LABELS[product.stock_estado] ?? STOCK_LABELS.disponible;
  const disabled = product.stock_estado === 'sin_stock';

  return (
    <div className="group relative bg-white border-2 border-navy flex flex-col transition-all hover:-translate-y-1 hover:shadow-brutal">
      {desc > 0 && <span className="tag-offer z-10">-{desc}%</span>}

      <Link
        href={`/producto/${product.slug}`}
        className="block aspect-square bg-sand-dark border-b-2 border-navy relative overflow-hidden"
      >
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-display text-navy/15 text-6xl select-none">
            {product.nombre.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-display text-navy/60">
            {product.sku ?? '—'}
          </span>
          <span className={`text-[10px] uppercase font-display px-1.5 py-0.5 ${stock.classes}`}>
            {stock.label}
          </span>
        </div>

        <Link href={`/producto/${product.slug}`} className="hover:text-ember">
          <h3 className="font-display text-base leading-tight line-clamp-2 text-navy mb-2 uppercase">
            {product.nombre}
          </h3>
        </Link>

        <div className="mt-auto pt-2 flex items-end justify-between gap-2">
          <div>
            {desc > 0 && (
              <p className="text-xs text-navy/50 line-through">
                {formatCLP(product.precio)}
              </p>
            )}
            <p className="font-display text-xl text-ember leading-none">
              {formatCLP(price)}
            </p>
            <p className="text-[11px] text-navy/60 uppercase tracking-wider mt-0.5">
              por {product.unidad}
            </p>
          </div>
          <button
            disabled={disabled}
            onClick={() =>
              add({
                id: product.id,
                slug: product.slug,
                nombre: product.nombre,
                precio: price,
                unidad: product.unidad,
                cantidad: 1,
                imagen_url: product.imagen_url,
                tipo: product.tipo
              })
            }
            className="w-10 h-10 bg-navy text-sand border-2 border-navy flex items-center justify-center hover:bg-ember hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Agregar al carrito"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
