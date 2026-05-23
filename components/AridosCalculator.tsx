'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Check, ShoppingCart, Calculator } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatNumber, formatCLP, formatQty } from '@/lib/format';
import type { Product } from '@/lib/types';

export function AridosCalculator({ aridos }: { aridos: Product[] }) {
  const [largo, setLargo] = useState(4);
  const [ancho, setAncho] = useState(3);
  const [prof, setProf] = useState(0.1);
  const [aridoId, setAridoId] = useState(aridos[0]?.id ?? '');
  const [qty, setQty] = useState(1.2);
  const [autoSync, setAutoSync] = useState(true);
  const [added, setAdded] = useState(false);

  const { add } = useCart();

  const arido = aridos.find((a) => a.id === aridoId);
  const m3 = useMemo(() => Math.max(0, largo * ancho * prof), [largo, ancho, prof]);
  const precioUnit = arido ? (arido.precio_oferta ?? arido.precio) : 0;

  useEffect(() => {
    if (autoSync) {
      setQty(Math.max(0.5, Math.round(m3 * 100) / 100));
    }
  }, [m3, autoSync]);

  const estimado = qty * precioUnit;

  function handleAdd() {
    if (!arido || qty <= 0) return;
    add({
      id: arido.id,
      slug: arido.slug,
      nombre: arido.nombre,
      precio: precioUnit,
      unidad: arido.unidad,
      cantidad: qty,
      imagen_url: arido.imagen_url,
      tipo: 'arido'
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  function bumpQty(delta: number) {
    setAutoSync(false);
    setQty((q) => Math.max(0.5, Math.round((q + delta) * 100) / 100));
  }

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="bg-bg-sub px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        <Calculator className="w-4 h-4 text-text-link" />
        <h3 className="text-sm font-semibold text-text-primary">Calculadora de áridos</h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="label">Largo (m)</label>
            <input
              type="number" min={0.1} step={0.1}
              value={largo}
              onChange={(e) => setLargo(parseFloat(e.target.value) || 0)}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="label">Ancho (m)</label>
            <input
              type="number" min={0.1} step={0.1}
              value={ancho}
              onChange={(e) => setAncho(parseFloat(e.target.value) || 0)}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="label">Prof. (m)</label>
            <input
              type="number" min={0.05} step={0.05}
              value={prof}
              onChange={(e) => setProf(parseFloat(e.target.value) || 0)}
              className="input text-sm"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="label">Tipo de árido</label>
          <select
            value={aridoId}
            onChange={(e) => setAridoId(e.target.value)}
            className="input text-sm"
          >
            {aridos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} — {formatCLP(a.precio_oferta ?? a.precio)}/m³
              </option>
            ))}
          </select>
        </div>

        <div className="bg-bg-sub rounded p-3 mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xs text-text-secondary uppercase">Volumen calculado</span>
            <span className="text-xl font-light text-text-primary">{formatNumber(m3)} m³</span>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <span className="text-2xs text-text-secondary uppercase mr-auto">Cantidad a pedir</span>
            <div className="flex items-center border border-gray-300 rounded bg-white">
              <button
                type="button"
                onClick={() => bumpQty(-0.5)}
                className="w-7 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-sub"
                aria-label="Restar 0.5 m³"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={0.5} step={0.5}
                value={qty}
                onChange={(e) => {
                  setAutoSync(false);
                  setQty(Math.max(0.5, parseFloat(e.target.value) || 0.5));
                }}
                className="w-14 h-8 text-center text-sm font-semibold bg-transparent border-x border-gray-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => bumpQty(0.5)}
                className="w-7 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-sub"
                aria-label="Sumar 0.5 m³"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <span className="text-2xs text-text-secondary">m³</span>
          </div>

          {!autoSync && (
            <button
              type="button"
              onClick={() => setAutoSync(true)}
              className="text-2xs text-text-link hover:underline mt-2"
            >
              ⟲ Volver al cálculo automático
            </button>
          )}
        </div>

        <div className="bg-brand-50 border border-brand-300 rounded p-3 flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-primary">Estimado</span>
          <span className="text-2xl font-light text-text-primary">
            {formatCLP(estimado)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!arido || qty <= 0}
          className={`btn w-full px-5 py-2.5 text-sm font-semibold rounded ${
            added
              ? 'bg-success text-white'
              : 'bg-text-link text-white hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Agregado: {formatQty(qty)} m³
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" /> Agregar {formatQty(qty)} m³ al carrito
            </>
          )}
        </button>

        <p className="text-2xs text-text-tertiary mt-2 italic">
          * Precio referencial IVA incluido. Despacho se cotiza según comuna y volumen.
        </p>
      </div>
    </div>
  );
}
