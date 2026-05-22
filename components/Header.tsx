'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPhoneDisplay } from '@/lib/format';
import type { Settings } from '@/lib/types';

const NAV = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/aridos', label: 'Áridos' },
  { href: '/arriendo', label: 'Arriendo' },
  { href: '/contacto', label: 'Contacto' }
];

export function Header({ settings }: { settings: Settings | null }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const phone = settings?.telefono_whatsapp ?? '+56957845292';
  const nombre = settings?.nombre_ferreteria ?? 'Nexo Sur';

  return (
    <header className="sticky top-0 z-40 bg-navy text-sand border-b-4 border-ember">
      {/* Top strip */}
      <div className="hidden md:block bg-navy-900 text-sand/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center font-body">
          <span className="tracking-wide">
            {settings?.direccion_fisica ?? 'Camino Paraguay, Saltos del Laja'}
          </span>
          <span className="tracking-wide">
            {settings?.horarios ?? 'Lun–Vie 8:30–19:00 · Sáb 9:00–14:00'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-ember border-2 border-sand flex items-center justify-center font-display text-navy text-lg transition-transform group-hover:rotate-[-6deg]">
            N
          </div>
          <span className="font-display text-xl tracking-tight uppercase">
            {nombre}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-display uppercase text-sm tracking-wider hover:text-ember transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${phone}`}
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:text-ember transition-colors"
          >
            <Phone className="w-4 h-4" />
            {formatPhoneDisplay(phone)}
          </a>
          <Link
            href="/carrito"
            className="relative flex items-center justify-center w-10 h-10 border-2 border-sand hover:bg-ember hover:text-navy transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-ember text-navy text-xs font-display w-5 h-5 flex items-center justify-center border-2 border-navy">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-1"
            aria-label="Menú"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden bg-navy-900 border-t-2 border-ember">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="font-display uppercase text-sm tracking-wider py-2 border-b border-sand/10 hover:text-ember"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`tel:${phone}`}
              className="font-display uppercase text-sm tracking-wider py-2 text-ember"
            >
              {formatPhoneDisplay(phone)}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
