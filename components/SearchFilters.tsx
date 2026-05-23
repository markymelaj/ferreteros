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
  { value: '',           label: 'Todos' },
  { value: 'producto',   label: 'Productos' },
  { value: 'arido',      label: 'Áridos' },
  { value: 'maquinaria', label: 'Arriendo' }
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
    <div className="bg-white rounded-card shadow-card p-4 lg:sticky lg:top-32">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">Filtros</h3>
        {hasFilters && (
          <button
            onClick={() => router.push('/buscar')}
            className="text-2xs text-text-link hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      {q && (
        <div className="mb-3 p-2 bg-bg-sub rounded text-2xs">
          <span className="text-text-secondary">Búsqueda:</span> <strong className="text-text-primary">"{q}"</strong>
        </div>
      )}

      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          Tipo
        </p>
        <div className="flex flex-col gap-1">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => update('tipo', t.value)}
              className={`text-left px-2 py-1.5 text-sm rounded transition-colors ${
                tipoActivo === t.value
                  ? 'bg-text-link text-white'
                  : 'text-text-secondary hover:bg-bg-sub'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tipoActivo !== 'maquinaria' && (
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Categoría
          </p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => update('cat', '')}
              className={`text-left px-2 py-1.5 text-sm rounded transition-colors ${
                !catActiva
                  ? 'bg-text-link text-white'
                  : 'text-text-secondary hover:bg-bg-sub'
              }`}
            >
              Todas
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                onClick={() => update('cat', c.slug)}
                className={`text-left px-2 py-1.5 text-sm rounded transition-colors ${
                  catActiva === c.slug
                    ? 'bg-text-link text-white'
                    : 'text-text-secondary hover:bg-bg-sub'
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
