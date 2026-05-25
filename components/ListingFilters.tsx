'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Category } from '@/lib/types';

interface Props {
  categorias: Category[];
}

const PRICE_RANGES = [
  { label: 'Hasta $5.000',         max: 5000 },
  { label: '$5.000 a $20.000',     min: 5000,  max: 20000 },
  { label: '$20.000 a $50.000',    min: 20000, max: 50000 },
  { label: 'Más de $50.000',       min: 50000 }
];

const STOCK_OPTS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'bajo_stock', label: 'Pocas unidades' }
];

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-text-primary mb-2"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

export function ListingFilters({ categorias }: Props) {
  return (
    <div className="bg-white rounded-card shadow-card px-4 py-2 lg:sticky lg:top-32">
      <Section title="Categorías" defaultOpen>
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="block text-sm text-text-secondary hover:text-text-link py-0.5"
          >
            {c.nombre}
          </Link>
        ))}
      </Section>

      <Section title="Tipo">
        <Link href="/materiales" className="block text-sm text-text-secondary hover:text-text-link py-0.5">
          Productos
        </Link>
        <Link href="/aridos" className="block text-sm text-text-secondary hover:text-text-link py-0.5">
          Áridos por m³
        </Link>
        <Link href="/arriendo" className="block text-sm text-text-secondary hover:text-text-link py-0.5">
          Arriendo de maquinaria
        </Link>
      </Section>

      <Section title="Precio">
        {PRICE_RANGES.map((r) => (
          <Link
            key={r.label}
            href={`/buscar?min=${r.min ?? ''}&max=${r.max ?? ''}`}
            className="block text-sm text-text-secondary hover:text-text-link py-0.5"
          >
            {r.label}
          </Link>
        ))}
      </Section>

      <Section title="Disponibilidad">
        {STOCK_OPTS.map((s) => (
          <Link
            key={s.value}
            href={`/buscar?stock=${s.value}`}
            className="block text-sm text-text-secondary hover:text-text-link py-0.5"
          >
            {s.label}
          </Link>
        ))}
      </Section>

      <Section title="Ofertas" defaultOpen={false}>
        <Link href="/buscar?oferta=1" className="block text-sm text-text-secondary hover:text-text-link py-0.5">
          Solo ofertas
        </Link>
        <Link href="/buscar?destacado=1" className="block text-sm text-text-secondary hover:text-text-link py-0.5">
          Destacados
        </Link>
      </Section>
    </div>
  );
}
