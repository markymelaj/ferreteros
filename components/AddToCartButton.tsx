'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart';
import type { CartItem } from '@/lib/types';

interface Props {
  product: Omit<CartItem, 'cantidad'>;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({ ...product, cantidad: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center border-2 border-navy">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-11 h-11 flex items-center justify-center hover:bg-navy hover:text-sand transition-colors"
          aria-label="Restar"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-14 h-11 text-center font-display text-lg bg-transparent border-x-2 border-navy focus:outline-none"
        />
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-11 h-11 flex items-center justify-center hover:bg-navy hover:text-sand transition-colors"
          aria-label="Sumar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className="btn-brutal disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {added ? (
          <>
            <Check className="w-4 h-4" /> Agregado
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
