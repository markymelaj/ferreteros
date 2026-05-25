import Link from 'next/link';
import {
  HardHat, Zap, Droplet, Wrench, Paintbrush, Sprout, Box,
  Package, Mountain, ShoppingBag, Hammer, Lightbulb, Layers
} from 'lucide-react';
import type { FC } from 'react';
import type { Category } from '@/lib/types';

const ICON_MAP: Record<string, FC<{ className?: string }>> = {
  HardHat, Zap, Droplet, Wrench, Paintbrush, Sprout, Box,
  Package, Mountain, ShoppingBag, Hammer, Lightbulb, Layers
};

interface Props {
  categories: Category[];
  baseHref?: string;
}

export function CategoryGrid({ categories, baseHref = '/categoria' }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {categories.map((cat) => {
        const Icon: FC<{ className?: string }> =
          (cat.icono ? ICON_MAP[cat.icono] : null) ?? Package;
        return (
          <Link
            key={cat.id}
            href={`${baseHref}/${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-4 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow text-center"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-bg-sub rounded-full group-hover:bg-brand-100 transition-colors">
              <Icon className="w-6 h-6 text-ink-900 group-hover:text-brand-700 transition-colors" />
            </div>
            <span className="text-sm font-semibold text-text-primary group-hover:text-text-link transition-colors leading-tight">
              {cat.nombre}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
