'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
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

  // Debounce y fetch
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

  // Cerrar al click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Atajo de teclado "/" enfoca el input
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
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center bg-sand/10 border-2 border-sand/30 focus-within:border-ember transition-colors">
        <Search className="w-4 h-4 ml-3 text-sand/60 shrink-0" />
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
          placeholder="Buscar productos, áridos, máquinas… ( / )"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-sand placeholder:text-sand/40 focus:outline-none"
        />
        {q && (
          <button
            onClick={() => { setQ(''); inputRef.current?.focus(); }}
            className="px-2 text-sand/60 hover:text-sand"
            aria-label="Limpiar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white text-navy border-2 border-navy shadow-brutal max-h-[70vh] overflow-y-auto z-50">
          {loading && (
            <div className="p-4 flex items-center gap-2 text-navy/60 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Buscando…
            </div>
          )}

          {!loading && results && results.total === 0 && (
            <div className="p-4 text-sm text-navy/60">
              Sin resultados para <strong>"{q}"</strong>. Prueba con otra palabra.
            </div>
          )}

          {!loading && results && results.productos.length > 0 && (
            <div>
              <h4 className="px-3 py-2 bg-sand text-[10px] font-display uppercase tracking-wider text-navy/60">
                Productos y áridos · {results.productos.length}
              </h4>
              <ul>
                {results.productos.slice(0, 6).map((p) => {
                  const price = effectivePrice(p.precio, p.precio_oferta);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/producto/${p.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-sand transition-colors border-b border-navy/5"
                      >
                        <div className="relative w-10 h-10 bg-sand-dark border border-navy/20 shrink-0 overflow-hidden">
                          {p.imagen_url ? (
                            <Image src={p.imagen_url} alt={p.nombre} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-display text-navy/30 text-xs">
                              {p.nombre.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.nombre}</p>
                          <p className="text-[11px] text-navy/60">
                            {p.tipo === 'arido' ? 'Árido · ' : ''}{formatCLP(price)} / {p.unidad}
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
              <h4 className="px-3 py-2 bg-sand text-[10px] font-display uppercase tracking-wider text-navy/60">
                Arriendo · {results.maquinaria.length}
              </h4>
              <ul>
                {results.maquinaria.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/arriendo/${m.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-sand transition-colors border-b border-navy/5"
                    >
                      <div className="relative w-10 h-10 bg-sand-dark border border-navy/20 shrink-0 overflow-hidden">
                        {m.imagen_url ? (
                          <Image src={m.imagen_url} alt={m.nombre} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display text-navy/30 text-xs">
                            {m.nombre.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{m.nombre}</p>
                        <p className="text-[11px] text-navy/60">
                          Arriendo · {formatCLP(m.tarifa_dia)} / día
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
              className="w-full px-3 py-2 bg-navy text-sand text-xs font-display uppercase tracking-wider hover:bg-ember hover:text-navy flex items-center justify-center gap-2"
            >
              Ver todos los resultados <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
