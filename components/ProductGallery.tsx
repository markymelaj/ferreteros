'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  cover: string | null;
  gallery: string[];
  alt: string;
  fallbackChar: string;
  discountBadge?: number;
}

/**
 * Galería con imagen principal grande + tira de miniaturas clickeables.
 * Si solo hay portada o no hay imágenes, se comporta como antes.
 */
export function ProductGallery({ cover, gallery, alt, fallbackChar, discountBadge }: Props) {
  // Lista combinada: portada primero, luego galería; sin duplicados
  const all = Array.from(new Set([cover, ...gallery].filter((u): u is string => !!u)));
  const [activeIdx, setActiveIdx] = useState(0);
  const activeUrl = all[activeIdx];

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="aspect-square bg-bg-sub rounded relative overflow-hidden">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-contain p-6"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary text-9xl">
            {fallbackChar}
          </div>
        )}
        {discountBadge && discountBadge > 0 && (
          <span className="absolute top-4 left-4 badge-danger text-sm px-3 py-1">
            -{discountBadge}% OFF
          </span>
        )}
      </div>

      {/* Tira de miniaturas — solo si hay más de una */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              className={`relative shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                idx === activeIdx
                  ? 'border-text-link'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={url}
                alt={`${alt} ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
