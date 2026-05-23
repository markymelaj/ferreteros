'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatQty } from '@/lib/format';
import type { CartItem } from '@/lib/types';

interface Props {
  product: Omit<CartItem, 'cantidad'>;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: Props) {
  const isArido = product.tipo === 'arido';
  const stepUnit = isArido ? 0.5 : 1;
  const minUnit = isArido ? 0.5 : 1;

  const { add } = useCart();
  const [qty, setQty] = useState<number>(isArido ? 1 : 1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({ ...product, cantidad: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center border-2 border-navy">
        <button
          onClick={() => setQty((q) => Math.max(minUnit, Math.round((q - stepUnit) * 100) / 100))}
          className="w-11 h-11 flex items-center justify-center hover:bg-navy hover:text-sand transition-colors"
          aria-label="Restar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={minUnit}
          step={stepUnit}
          value={qty}
          onChange={(e) => setQty(Math.max(minUnit, parseFloat(e.target.value) || minUnit))}
          className="w-16 h-11 text-center font-display text-lg bg-transparent border-x-2 border-navy focus:outline-none"
        />
        <button
          onClick={() => setQty((q) => Math.round((q + stepUnit) * 100) / 100)}
          className="w-11 h-11 flex items-center justify-center hover:bg-navy hover:text-sand transition-colors"
          aria-label="Sumar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <span className="font-display uppercase text-xs tracking-wider text-navy/60">
        {product.unidad}
      </span>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`btn-brutal disabled:opacity-50 disabled:cursor-not-allowed ${added ? 'bg-whatsapp text-white' : ''}`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4" /> Agregado {formatQty(qty)} {isArido ? 'm³' : ''}
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Agregar al carrito
          </>
        )}
      </button>
    </div>
  );
}
