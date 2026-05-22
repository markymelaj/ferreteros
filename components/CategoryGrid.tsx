import Link from 'next/link';
import { HardHat, Zap, Droplet, Wrench, Paintbrush, Sprout, Box } from 'lucide-react';
import type { Category } from '@/lib/types';

const ICONS: Record<string, any> = {
  HardHat,
  Zap,
  Droplet,
  Wrench,
  Paintbrush,
  Sprout
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {categories.map((c) => {
        const Icon = ICONS[c.icono ?? ''] ?? Box;
        return (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="group bg-white border-2 border-navy p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-ember hover:-translate-y-1 transition-all"
          >
            <Icon className="w-7 h-7 text-navy group-hover:text-navy" />
            <span className="font-display uppercase text-xs tracking-wider text-navy">
              {c.nombre}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
