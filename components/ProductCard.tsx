'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Truck } from 'lucide-react';
import { formatCLP, effectivePrice, discountPct } from '@/lib/format';
import type { Product } from '@/lib/types';

const STOCK_LABELS: Record<string, { label: string; tone: 'ok' | 'warn' | 'no' | 'neu' }> = {
  disponible:  { label: 'Stock disponible',   tone: 'ok' },
  bajo_stock:  { label: '¡Últimas unidades!', tone: 'warn' },
  sin_stock:   { label: 'Sin stock',          tone: 'no' },
  consultar:   { label: 'Consultar stock',    tone: 'neu' }
};

const STOCK_CLASSES: Record<string, string> = {
  ok:   'text-success',
  warn: 'text-warning',
  no:   'text-danger',
  neu:  'text-text-secondary'
};

export function ProductCard({ product }: { product: Product }) {
  const price = effectivePrice(product.precio, product.precio_oferta);
  const desc = discountPct(product.precio, product.precio_oferta);
  const stock = STOCK_LABELS[product.stock_estado] ?? STOCK_LABELS.disponible;
  const isOferta = desc > 0;
  const isHotDeal = desc >= 15;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="card group flex flex-col h-full overflow-hidden"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-white">
        {product.imagen_url ? (
          <Image
            src={product.imagen_url}
            alt={product.nombre}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-text-tertiary font-light">
            {product.nombre.charAt(0)}
          </div>
        )}

        {/* Badge superior izquierdo */}
        {isHotDeal && (
          <span className="absolute top-2 left-2 badge-danger">
            -{desc}% OFF
          </span>
        )}
        {product.destacado && !isHotDeal && (
          <span className="absolute top-2 left-2 badge-warning">
            Destacado
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 flex flex-col flex-1">
        {/* Precio */}
        <div className="mb-1">
          {isOferta && (
            <span className="price-old">{formatCLP(product.precio)}</span>
          )}
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="price-current">{formatCLP(price)}</span>
            {isOferta && (
              <span className="tag-discount">{desc}% OFF</span>
            )}
          </div>
          <p className="text-2xs text-text-secondary">
            por {product.unidad}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-sm text-text-primary leading-snug line-clamp-2 mt-1 group-hover:text-text-link">
          {product.nombre}
        </h3>

        {/* SKU */}
        {product.sku && (
          <p className="text-2xs text-text-tertiary mt-1">{product.sku}</p>
        )}

        {/* Bottom info row */}
        <div className="mt-auto pt-2 space-y-1">
          <div className="flex items-center gap-1 text-2xs text-success font-semibold">
            <Truck className="w-3 h-3" />
            Despacho a tu comuna
          </div>
          <div className={`text-2xs font-semibold ${STOCK_CLASSES[stock.tone]}`}>
            {stock.label}
          </div>
        </div>
      </div>
    </Link>
  );
}
