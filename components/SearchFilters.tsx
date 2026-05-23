'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X } from 'lucide-react';
import type { Category } from '@/lib/types';

interface Props {
  categorias: Category[];
  q: string;
  tipoActivo: string;
  catActiva: string;
}

const TIPOS = [
  { value: '',          label: 'Todos' },
  { value: 'producto',  label: 'Productos' },
  { value: 'arido',     label: 'Áridos' },
  { value: 'maquinaria',label: 'Maquinaria' }
];

export function SearchFilters({ categorias, q, tipoActivo, catActiva }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      router.push(`/buscar?${sp.toString()}`);
    },
    [params, router]
  );

  const hasFilters = q || tipoActivo || catActiva;

  return (
    <div className="bg-white border-2 border-navy p-4 lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display uppercase text-sm text-navy">Filtros</h3>
        {hasFilters && (
          <button
            onClick={() => router.push('/buscar')}
            className="text-[10px] uppercase font-display text-ember hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {q && (
        <div className="mb-4 p-2 bg-sand text-xs border border-navy/20">
          Búsqueda: <strong>"{q}"</strong>
        </div>
      )}

      <div className="mb-4">
        <p className="font-display uppercase text-[10px] tracking-wider text-navy/60 mb-2">
          Tipo
        </p>
        <div className="flex flex-col gap-1">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => update('tipo', t.value)}
              className={`text-left px-2 py-1.5 text-sm border-2 transition-colors ${
                tipoActivo === t.value
                  ? 'bg-navy text-sand border-navy'
                  : 'bg-transparent text-navy border-transparent hover:border-navy/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tipoActivo !== 'maquinaria' && (
        <div>
          <p className="font-display uppercase text-[10px] tracking-wider text-navy/60 mb-2">
            Categoría
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => update('cat', '')}
              className={`text-left px-2 py-1.5 text-sm border-2 transition-colors ${
                !catActiva
                  ? 'bg-navy text-sand border-navy'
                  : 'bg-transparent text-navy border-transparent hover:border-navy/30'
              }`}
            >
              Todas
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => update('cat', c.slug)}
                className={`text-left px-2 py-1.5 text-sm border-2 transition-colors ${
                  catActiva === c.slug
                    ? 'bg-navy text-sand border-navy'
                    : 'bg-transparent text-navy border-transparent hover:border-navy/30'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
