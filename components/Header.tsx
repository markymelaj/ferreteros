'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, MapPin, ChevronDown, Phone } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { SearchBar } from './SearchBar';
import type { Settings } from '@/lib/types';

const NAV = [
  { href: '/materiales', label: 'Materiales' },
  { href: '/aridos',     label: 'Áridos' },
  { href: '/arriendo',   label: 'Arriendo' },
  { href: '/contacto',   label: 'Contacto' }
];

const CATEGORIES_TOP = [
  { slug: 'construccion', label: 'Construcción' },
  { slug: 'electrico',    label: 'Eléctrico' },
  { slug: 'gasfiteria',   label: 'Gasfitería' },
  { slug: 'herramientas', label: 'Herramientas' },
  { slug: 'pinturas',     label: 'Pinturas' },
  { slug: 'jardin',       label: 'Jardín y Riego' }
];

export function Header({ settings }: { settings: Settings | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const nombre = settings?.nombre_ferreteria ?? 'Nexo Sur';
  const comunas = settings?.comunas_despacho ?? [];

  return (
    <header className="sticky top-0 z-40 bg-brand-500 shadow-nav">
      {/* Línea principal — logo, search, carrito */}
      <div className="container-page py-2.5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-ink-900 text-brand-500 flex items-center justify-center font-bold text-lg rounded">
              N
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-ink-900 text-base leading-tight">{nombre}</div>
              <div className="text-2xs text-ink-700 leading-tight">Ferretería · Áridos · Arriendo</div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Ubicación */}
            <button className="hidden md:flex items-center gap-1 text-xs text-ink-900 hover:text-ink-700 px-2 py-1">
              <MapPin className="w-4 h-4" />
              <div className="text-left">
                <div className="text-2xs leading-tight">Despacho a</div>
                <div className="font-semibold leading-tight flex items-center gap-0.5">
                  {comunas[0] ?? 'Tu comuna'} <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </button>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative flex items-center gap-1.5 px-3 py-2 hover:bg-brand-400/50 rounded transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5 text-ink-900" />
              <span className="hidden md:inline text-sm font-semibold text-ink-900">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-text-link text-white text-2xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-ink-900"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tira de categorías */}
      <div className="hidden lg:block bg-brand-400/50 border-t border-brand-600/20">
        <div className="container-page">
          <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="px-3 py-2 text-ink-900 hover:text-ink-700 font-semibold whitespace-nowrap"
              >
                {n.label}
              </Link>
            ))}
            <span className="w-px h-4 bg-ink-900/20 mx-1" />
            {CATEGORIES_TOP.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                className="px-3 py-2 text-ink-900/80 hover:text-ink-900 whitespace-nowrap"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-brand-600/20 shadow-card">
          <nav className="container-page py-3 flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm font-semibold text-ink-900 border-b border-gray-100"
              >
                {n.label}
              </Link>
            ))}
            <div className="pt-3 pb-1 text-2xs uppercase tracking-wider text-text-secondary font-semibold">
              Categorías
            </div>
            {CATEGORIES_TOP.map((c) => (
              <Link
                key={c.slug}
                href={`/categoria/${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm text-text-primary border-b border-gray-100"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
