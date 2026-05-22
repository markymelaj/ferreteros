'use client';

import { useState, useMemo } from 'react';
import { formatNumber, formatCLP } from '@/lib/format';
import type { Product } from '@/lib/types';

export function AridosCalculator({ aridos }: { aridos: Product[] }) {
  const [largo, setLargo] = useState(4);
  const [ancho, setAncho] = useState(3);
  const [prof, setProf] = useState(0.1);
  const [aridoId, setAridoId] = useState(aridos[0]?.id ?? '');

  const arido = aridos.find((a) => a.id === aridoId);
  const m3 = useMemo(() => largo * ancho * prof, [largo, ancho, prof]);
  const precioUnit = arido ? (arido.precio_oferta ?? arido.precio) : 0;
  const estimado = m3 * precioUnit;

  return (
    <div className="bg-white border-2 border-navy p-6">
      <h3 className="font-display uppercase text-xl text-navy mb-1">
        Calculadora de Volumen
      </h3>
      <p className="text-sm text-navy/70 mb-5">
        Indica las dimensiones del área a cubrir y obtén una estimación.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="label">Largo (m)</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={largo}
            onChange={(e) => setLargo(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Ancho (m)</label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={ancho}
            onChange={(e) => setAncho(parseFloat(e.target.value) || 0)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Profundidad (m)</label>
          <input
            type="number"
            min={0.05}
            step={0.05}
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

      <div className="border-t-2 border-navy pt-4 grid grid-cols-2 gap-3">
        <div className="bg-sand p-3 border-2 border-navy">
          <p className="text-[11px] uppercase font-display tracking-wider text-navy/60">
            Volumen
          </p>
          <p className="font-display text-2xl text-navy">{formatNumber(m3)} m³</p>
        </div>
        <div className="bg-ember p-3 border-2 border-navy">
          <p className="text-[11px] uppercase font-display tracking-wider text-navy">
            Estimado
          </p>
          <p className="font-display text-2xl text-navy">{formatCLP(estimado)}</p>
        </div>
      </div>
      <p className="text-[11px] text-navy/60 mt-3 italic">
        * Precio referencial. Despacho se cotiza según comuna y volumen.
      </p>
    </div>
  );
}
