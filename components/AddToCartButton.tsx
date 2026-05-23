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
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({ ...product, cantidad: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center border border-gray-300 rounded">
        <button
          onClick={() => setQty((q) => Math.max(minUnit, Math.round((q - stepUnit) * 100) / 100))}
          className="w-10 h-11 flex items-center justify-center text-text-secondary hover:bg-bg-sub"
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
          className="w-14 h-11 text-center font-semibold bg-transparent border-x border-gray-300 focus:outline-none"
        />
        <button
          onClick={() => setQty((q) => Math.round((q + stepUnit) * 100) / 100)}
          className="w-10 h-11 flex items-center justify-center text-text-secondary hover:bg-bg-sub"
          aria-label="Sumar"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`btn flex-1 px-5 py-2.5 text-sm font-semibold rounded ${
          added
            ? 'bg-success text-white'
            : 'bg-text-link text-white hover:bg-blue-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
