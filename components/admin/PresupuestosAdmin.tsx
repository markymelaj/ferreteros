'use client';

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP, whatsappLink } from '@/lib/format';
import type { Presupuesto } from '@/lib/types';

const ESTADOS: Presupuesto['estado'][] = ['enviado', 'contactado', 'vendido', 'perdido'];

const STATE_COLORS: Record<Presupuesto['estado'], string> = {
  enviado:    'bg-navy/10 text-navy',
  contactado: 'bg-ember/20 text-navy',
  vendido:    'bg-whatsapp/20 text-navy',
  perdido:    'bg-red-100 text-red-700'
};

export function PresupuestosAdmin({ initial }: { initial: Presupuesto[] }) {
  const [items, setItems] = useState<Presupuesto[]>(initial);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const filtered = items.filter((p) => !filterEstado || p.estado === filterEstado);

  async function updateEstado(id: string, estado: Presupuesto['estado']) {
    const { error } = await supabase.from('presupuestos').update({ estado }).eq('id', id);
    if (error) return alert(error.message);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="font-display uppercase text-3xl text-navy">Presupuestos</h1>
          <p className="text-navy/70 text-sm">{items.length} registrados</p>
        </div>
        <select className="input max-w-[200px]" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </header>

      <div className="bg-white border-2 border-navy">
        <table className="w-full text-sm">
          <thead className="bg-sand">
            <tr>
              <th className="p-3"></th>
              <th className="text-left p-3 font-display uppercase text-xs">Fecha</th>
              <th className="text-left p-3 font-display uppercase text-xs">Cliente</th>
              <th className="text-left p-3 font-display uppercase text-xs">Teléfono</th>
              <th className="text-left p-3 font-display uppercase text-xs">Comuna</th>
              <th className="text-right p-3 font-display uppercase text-xs">Total</th>
              <th className="text-left p-3 font-display uppercase text-xs">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <Fragment key={p.id}>
                <tr className="border-t border-navy/10 hover:bg-sand/40">
                  <td className="p-3">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} aria-label="Detalle">
                      {expanded === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-3 whitespace-nowrap">{new Date(p.fecha).toLocaleString('es-CL')}</td>
                  <td className="p-3 font-semibold">{p.cliente_nombre ?? '—'}</td>
                  <td className="p-3">
                    {p.cliente_telefono ? (
                      <a
                        href={whatsappLink(p.cliente_telefono, 'Hola, gracias por tu cotización en Nexo Sur:')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy hover:text-ember flex items-center gap-1"
                      >
                        {p.cliente_telefono} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '—'}
                  </td>
                  <td className="p-3">{p.comuna ?? '—'}</td>
                  <td className="p-3 text-right font-semibold">{formatCLP(p.total)}</td>
                  <td className="p-3">
                    <select
                      className={`text-[10px] uppercase font-display px-2 py-1 border border-navy/30 ${STATE_COLORS[p.estado]}`}
                      value={p.estado}
                      onChange={(e) => updateEstado(p.id, e.target.value as Presupuesto['estado'])}
                    >
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
                {expanded === p.id && (
                  <tr className="bg-sand/40">
                    <td colSpan={7} className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-display uppercase text-xs tracking-wider text-navy/60 mb-2">Despacho</h4>
                          <p className="text-sm">{p.direccion_despacho ?? '—'}</p>
                          {p.cliente_email && <p className="text-sm text-navy/70 mt-1">{p.cliente_email}</p>}
                          {p.observaciones && (
                            <>
                              <h4 className="font-display uppercase text-xs tracking-wider text-navy/60 mt-3 mb-1">Observaciones</h4>
                              <p className="text-sm italic">{p.observaciones}</p>
                            </>
                          )}
                        </div>
                        <div>
                          <h4 className="font-display uppercase text-xs tracking-wider text-navy/60 mb-2">Productos</h4>
                          <ul className="text-xs space-y-1">
                            {(p.items as any[]).map((it, i) => (
                              <li key={i}>
                                <span className="font-semibold">{it.cantidad} {it.unidad}</span> · {it.nombre} — {formatCLP(it.precio * it.cantidad)}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 text-xs text-navy/70">
                            Subtotal: <strong>{formatCLP(p.subtotal)}</strong> · IVA: <strong>{formatCLP(p.iva)}</strong> · Total: <strong className="text-ember">{formatCLP(p.total)}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-navy/50">Sin cotizaciones</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
