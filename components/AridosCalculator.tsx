'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatNumber, formatCLP, formatQty } from '@/lib/format';
import type { Product } from '@/lib/types';

export function AridosCalculator({ aridos }: { aridos: Product[] }) {
  const [largo, setLargo] = useState(4);
  const [ancho, setAncho] = useState(3);
  const [prof, setProf] = useState(0.1);
  const [aridoId, setAridoId] = useState(aridos[0]?.id ?? '');
  const [qty, setQty] = useState(1.2); // cantidad final a agregar (editable)
  const [autoSync, setAutoSync] = useState(true); // si está activo, qty sigue al cálculo
  const [added, setAdded] = useState(false);

  const { add } = useCart();

  const arido = aridos.find((a) => a.id === aridoId);
  const m3 = useMemo(() => Math.max(0, largo * ancho * prof), [largo, ancho, prof]);
  const precioUnit = arido ? (arido.precio_oferta ?? arido.precio) : 0;

  // Sincronizar qty con el cálculo si el usuario no la editó manualmente
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
    <div className="bg-white border-2 border-navy p-5 shadow-brutal-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-display uppercase text-[10px] tracking-widest text-ember">
          Calculadora
        </span>
      </div>
      <h3 className="font-display uppercase text-xl text-navy mb-1">
        Calcula tu volumen
      </h3>
      <p className="text-sm text-navy/70 mb-4">
        Ingresa las dimensiones del área a cubrir.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label className="label">Largo (m)</label>
          <input
            type="number" min={0.1} step={0.1}
            value={largo}
            onChange={(e) => setLargo(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Ancho (m)</label>
          <input
            type="number" min={0.1} step={0.1}
            value={ancho}
            onChange={(e) => setAncho(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Prof. (m)</label>
          <input
            type="number" min={0.05} step={0.05}
            value={prof}
            onChange={(e) => setProf(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="label">Tipo de árido</label>
        <select
          value={aridoId}
          onChange={(e) => setAridoId(e.target.value)}
          className="input"
        >
          {aridos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} — {formatCLP(a.precio_oferta ?? a.precio)}/m³
            </option>
          ))}
        </select>
      </div>

      {/* RESULTADO + AJUSTE */}
      <div className="bg-sand border-2 border-navy p-3 mb-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[11px] uppercase font-display tracking-wider text-navy/60">
            Volumen calculado
          </span>
          <span className="font-display text-2xl text-navy leading-none">
            {formatNumber(m3)} m³
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-navy/20">
          <span className="text-[11px] uppercase font-display tracking-wider text-navy/60 mr-auto">
            Cantidad a pedir
          </span>
          <div className="flex items-center border-2 border-navy bg-white">
            <button
              type="button"
              onClick={() => bumpQty(-0.5)}
              className="w-8 h-9 flex items-center justify-center hover:bg-navy hover:text-sand"
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
              className="w-16 h-9 text-center bg-transparent border-x-2 border-navy font-display text-navy text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => bumpQty(0.5)}
              className="w-8 h-9 flex items-center justify-center hover:bg-navy hover:text-sand"
              aria-label="Sumar 0.5 m³"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="font-display text-sm text-navy">m³</span>
        </div>

        {!autoSync && (
          <button
            type="button"
            onClick={() => setAutoSync(true)}
            className="text-[10px] uppercase font-display tracking-wider text-ember hover:underline mt-2"
          >
            ⟲ Volver a usar el cálculo automático
          </button>
        )}
      </div>

      {/* TOTAL + CTA */}
      <div className="bg-ember border-2 border-navy p-3 flex items-center justify-between mb-3">
        <span className="font-display uppercase text-sm text-navy">Estimado</span>
        <span className="font-display text-2xl text-navy leading-none">
          {formatCLP(estimado)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!arido || qty <= 0}
        className={`btn-brutal w-full disabled:opacity-50 disabled:cursor-not-allowed ${added ? 'bg-whatsapp text-white border-navy' : ''}`}
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

      <p className="text-[11px] text-navy/60 mt-3 italic">
        * Precio referencial IVA incluido. Despacho se cotiza según comuna y volumen.
      </p>
    </div>
  );
}
