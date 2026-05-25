'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { formatCLP, effectivePrice } from '@/lib/format';
import type { Product, Maquinaria } from '@/lib/types';

interface SearchResults {
  productos: Product[];
  maquinaria: Maquinaria[];
  total: number;
}

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const goToFullResults = useCallback(() => {
    if (q.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }, [q, router]);

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center bg-white rounded shadow-sm">
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              goToFullResults();
            }
          }}
          placeholder="Buscar materiales, áridos, máquinas y más..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none rounded-l"
        />
        {q && (
          <button
            onClick={() => { setQ(''); inputRef.current?.focus(); }}
            className="px-2 text-text-tertiary hover:text-text-primary"
            aria-label="Limpiar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={goToFullResults}
          className="px-4 py-2.5 text-text-secondary hover:text-text-primary border-l border-gray-200"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded shadow-card-hover max-h-[70vh] overflow-y-auto z-50 border border-gray-200">
          {loading && (
            <div className="p-4 flex items-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando…
            </div>
          )}

          {!loading && results && results.total === 0 && (
            <div className="p-4 text-sm text-text-secondary">
              Sin resultados para <strong>"{q}"</strong>.
            </div>
          )}

          {!loading && results && results.productos.length > 0 && (
            <div>
              <h4 className="px-4 py-2 bg-bg-sub text-2xs font-bold uppercase tracking-wider text-text-secondary">
                Productos · {results.productos.length}
              </h4>
              <ul>
                {results.productos.slice(0, 6).map((p) => {
                  const price = effectivePrice(p.precio, p.precio_oferta);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/producto/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-sub transition-colors"
                      >
                        <div className="relative w-12 h-12 bg-bg-sub shrink-0 overflow-hidden rounded">
                          {p.imagen_url ? (
                            <Image src={p.imagen_url} alt={p.nombre} fill sizes="48px" className="object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
                              {p.nombre.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{p.nombre}</p>
                          <p className="text-2xs text-text-secondary">
                            {p.tipo === 'arido' ? 'Árido · ' : ''}
                            <span className="text-text-primary font-semibold">{formatCLP(price)}</span> / {p.unidad}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!loading && results && results.maquinaria.length > 0 && (
            <div>
              <h4 className="px-4 py-2 bg-bg-sub text-2xs font-bold uppercase tracking-wider text-text-secondary">
                Arriendo · {results.maquinaria.length}
              </h4>
              <ul>
                {results.maquinaria.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/arriendo/${m.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-sub transition-colors"
                    >
                      <div className="relative w-12 h-12 bg-bg-sub shrink-0 overflow-hidden rounded">
                        {m.imagen_url ? (
                          <Image src={m.imagen_url} alt={m.nombre} fill sizes="48px" className="object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">
                            {m.nombre.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary truncate">{m.nombre}</p>
                        <p className="text-2xs text-text-secondary">
                          Arriendo · <span className="text-text-primary font-semibold">{formatCLP(m.tarifa_dia)}</span> / día
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results && results.total > 0 && (
            <button
              onClick={goToFullResults}
              className="w-full px-4 py-2.5 text-sm font-semibold text-text-link hover:bg-bg-sub border-t border-gray-200"
            >
              Ver todos los resultados →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
