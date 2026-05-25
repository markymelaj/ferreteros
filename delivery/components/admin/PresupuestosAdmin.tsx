'use client';

import { useState, Fragment } from 'react';
import {
  ChevronDown, ChevronUp, ExternalLink, MapPin, Download, FileText, Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP, whatsappLink, formatQty } from '@/lib/format';
import type { Presupuesto } from '@/lib/types';

const ESTADOS: Presupuesto['estado'][] = ['enviado', 'contactado', 'vendido', 'perdido'];

const STATE_STYLES: Record<Presupuesto['estado'], string> = {
  enviado:    'bg-ink-50 text-ink-800 border-ink-200',
  contactado: 'bg-brand-50 text-brand-800 border-brand-200',
  vendido:    'bg-green-50 text-green-800 border-green-200',
  perdido:    'bg-red-50 text-red-800 border-red-200'
};

const UBIC_LABELS: Record<string, { label: string; tone: string }> = {
  direccion:  { label: 'Dirección',  tone: 'bg-blue-50 text-blue-700' },
  gps:        { label: 'GPS',        tone: 'bg-green-50 text-green-700' },
  referencia: { label: 'Rural',      tone: 'bg-amber-50 text-amber-700' }
};

export function PresupuestosAdmin({ initial }: { initial: Presupuesto[] }) {
  const [items, setItems] = useState<Presupuesto[]>(initial);
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const filtered = items.filter((p) => {
    if (filterEstado && p.estado !== filterEstado) return false;
    if (search) {
      const s = search.toLowerCase();
      const inName = (p.cliente_nombre ?? '').toLowerCase().includes(s);
      const inPhone = (p.cliente_telefono ?? '').includes(s);
      const inEmail = (p.cliente_email ?? '').toLowerCase().includes(s);
      const inComuna = (p.comuna ?? '').toLowerCase().includes(s);
      if (!(inName || inPhone || inEmail || inComuna)) return false;
    }
    return true;
  });

  async function updateEstado(id: string, estado: Presupuesto['estado']) {
    const { error } = await supabase.from('presupuestos').update({ estado }).eq('id', id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, estado } : p)));
  }

  /** Exporta el listado filtrado a CSV con BOM para Excel. */
  function exportCSV() {
    const headers = [
      'fecha', 'cliente', 'telefono', 'email', 'comuna',
      'tipo_ubicacion', 'direccion', 'lat', 'lng',
      'subtotal', 'iva', 'total', 'estado',
      'productos', 'observaciones'
    ];
    const rows = filtered.map((p) => {
      const productos = (p.items as any[])
        .map((it) => `${formatQty(it.cantidad)} ${it.unidad} ${it.nombre}`)
        .join(' | ');
      return [
        new Date(p.fecha).toLocaleString('es-CL'),
        p.cliente_nombre ?? '',
        p.cliente_telefono ?? '',
        p.cliente_email ?? '',
        p.comuna ?? '',
        p.ubicacion_tipo ?? 'direccion',
        p.direccion_despacho ?? '',
        p.lat ?? '',
        p.lng ?? '',
        p.subtotal,
        p.iva,
        p.total,
        p.estado,
        productos,
        p.observaciones ?? ''
      ];
    });
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        r.map((cell) => {
          const s = String(cell ?? '');
          if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuestos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Presupuestos</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              <FileText className="w-3.5 h-3.5 inline mr-1" />
              {items.length} registrado{items.length === 1 ? '' : 's'} · {filtered.length} en vista
            </p>
          </div>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-outline text-sm">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            <input
              placeholder="Buscar por nombre, teléfono, email, comuna…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 pl-9 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-text-link focus:ring-1 focus:ring-text-link/30"
            />
          </div>
          <select
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-text-link min-w-[170px]"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </header>

      {/* Tabla desktop */}
      <div className="hidden lg:block bg-white rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-sub text-text-secondary text-xs uppercase">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="text-left p-3 font-semibold">Fecha</th>
              <th className="text-left p-3 font-semibold">Cliente</th>
              <th className="text-left p-3 font-semibold">Teléfono</th>
              <th className="text-left p-3 font-semibold">Comuna</th>
              <th className="text-left p-3 font-semibold">Ubicación</th>
              <th className="text-right p-3 font-semibold">Total</th>
              <th className="text-left p-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const tipoLabel = UBIC_LABELS[p.ubicacion_tipo ?? 'direccion'] ?? UBIC_LABELS.direccion;
              const tieneGPS = p.lat != null && p.lng != null;
              return (
                <Fragment key={p.id}>
                  <tr className="border-t border-gray-100 hover:bg-bg-hover">
                    <td className="p-3">
                      <button
                        onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        aria-label="Detalle"
                        className="p-1 hover:bg-bg-sub rounded transition-colors"
                      >
                        {expanded === p.id ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                      </button>
                    </td>
                    <td className="p-3 whitespace-nowrap text-text-secondary text-xs">
                      {new Date(p.fecha).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 font-semibold text-text-primary">{p.cliente_nombre ?? '—'}</td>
                    <td className="p-3">
                      {p.cliente_telefono ? (
                        <a
                          href={whatsappLink(p.cliente_telefono, 'Hola, gracias por tu cotización en Nexo Sur:')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-link hover:underline inline-flex items-center gap-1"
                        >
                          {p.cliente_telefono} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-text-tertiary">—</span>}
                    </td>
                    <td className="p-3 text-text-secondary">{p.comuna ?? '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-2xs uppercase font-semibold px-1.5 py-0.5 rounded ${tipoLabel.tone}`}>
                          {tipoLabel.label}
                        </span>
                        {tieneGPS && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-link hover:underline"
                            title="Ver en Google Maps"
                          >
                            <MapPin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-text-primary whitespace-nowrap">{formatCLP(p.total)}</td>
                    <td className="p-3">
                      <select
                        className={`text-2xs uppercase font-semibold px-2 py-1 border rounded ${STATE_STYLES[p.estado]}`}
                        value={p.estado}
                        onChange={(e) => updateEstado(p.id, e.target.value as Presupuesto['estado'])}
                      >
                        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expanded === p.id && (
                    <tr className="bg-bg-sub">
                      <td colSpan={8} className="p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-2xs uppercase tracking-wider font-semibold text-text-secondary mb-2">
                              Despacho ({tipoLabel.label})
                            </h4>
                            <p className="text-sm text-text-primary">{p.direccion_despacho ?? '—'}</p>
                            {tieneGPS && (
                              <p className="text-xs text-text-secondary mt-1 font-mono">
                                📍 {p.lat!.toFixed(5)}, {p.lng!.toFixed(5)} ·{' '}
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-text-link hover:underline"
                                >
                                  Abrir en Google Maps →
                                </a>
                              </p>
                            )}
                            {p.cliente_email && <p className="text-sm text-text-secondary mt-1">{p.cliente_email}</p>}
                            {p.observaciones && (
                              <>
                                <h4 className="text-2xs uppercase tracking-wider font-semibold text-text-secondary mt-3 mb-1">
                                  Observaciones
                                </h4>
                                <p className="text-sm italic text-text-primary">{p.observaciones}</p>
                              </>
                            )}
                          </div>
                          <div>
                            <h4 className="text-2xs uppercase tracking-wider font-semibold text-text-secondary mb-2">
                              Productos cotizados
                            </h4>
                            <ul className="text-xs space-y-1">
                              {(p.items as any[]).map((it, i) => (
                                <li key={i} className="text-text-primary">
                                  <span className="font-semibold">{formatQty(it.cantidad)} {it.unidad}</span> · {it.nombre} — {formatCLP(it.precio * it.cantidad)}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-text-secondary space-y-0.5">
                              <div>Subtotal: <strong className="text-text-primary">{formatCLP(p.subtotal)}</strong></div>
                              <div>IVA: <strong className="text-text-primary">{formatCLP(p.iva)}</strong></div>
                              <div className="text-sm pt-1">Total: <strong className="text-success">{formatCLP(p.total)}</strong></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-text-tertiary">Sin cotizaciones</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile/tablet */}
      <div className="lg:hidden space-y-2">
        {filtered.map((p) => {
          const tipoLabel = UBIC_LABELS[p.ubicacion_tipo ?? 'direccion'] ?? UBIC_LABELS.direccion;
          const tieneGPS = p.lat != null && p.lng != null;
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className="bg-white rounded-card shadow-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full p-3 text-left hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-text-primary text-sm line-clamp-1">
                    {p.cliente_nombre ?? '—'}
                  </p>
                  <span className="text-xs text-text-tertiary shrink-0">
                    {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-2xs uppercase font-semibold px-1.5 py-0.5 rounded ${tipoLabel.tone}`}>
                      {tipoLabel.label}
                    </span>
                    <span className={`text-2xs uppercase font-semibold px-1.5 py-0.5 border rounded ${STATE_STYLES[p.estado]}`}>
                      {p.estado}
                    </span>
                    {p.comuna && (
                      <span className="text-2xs text-text-tertiary">· {p.comuna}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-text-primary">{formatCLP(p.total)}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-bg-sub">
                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap gap-2 mb-3 pt-2">
                    {p.cliente_telefono && (
                      <a
                        href={whatsappLink(p.cliente_telefono, 'Hola, gracias por tu cotización en Nexo Sur:')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-wa text-xs py-1.5 px-2.5"
                      >
                        💬 {p.cliente_telefono}
                      </a>
                    )}
                    {tieneGPS && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs py-1.5 px-2.5"
                      >
                        <MapPin className="w-3 h-3" /> Ver en Maps
                      </a>
                    )}
                    <select
                      className={`text-2xs uppercase font-semibold px-2 py-1 border rounded ${STATE_STYLES[p.estado]}`}
                      value={p.estado}
                      onChange={(e) => updateEstado(p.id, e.target.value as Presupuesto['estado'])}
                    >
                      {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Despacho */}
                  <div className="mb-3">
                    <p className="text-2xs uppercase font-semibold text-text-secondary mb-1">Despacho</p>
                    <p className="text-xs text-text-primary">{p.direccion_despacho ?? '—'}</p>
                    {tieneGPS && (
                      <p className="text-2xs text-text-secondary mt-0.5 font-mono">
                        📍 {p.lat!.toFixed(5)}, {p.lng!.toFixed(5)}
                      </p>
                    )}
                    {p.cliente_email && (
                      <p className="text-xs text-text-secondary mt-0.5">{p.cliente_email}</p>
                    )}
                  </div>

                  {/* Productos */}
                  <div className="mb-3">
                    <p className="text-2xs uppercase font-semibold text-text-secondary mb-1">Productos</p>
                    <ul className="text-xs space-y-0.5">
                      {(p.items as any[]).map((it, i) => (
                        <li key={i} className="text-text-primary">
                          <span className="font-semibold">{formatQty(it.cantidad)} {it.unidad}</span> · {it.nombre}
                          <span className="text-text-secondary"> — {formatCLP(it.precio * it.cantidad)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Totales */}
                  <div className="text-xs text-text-secondary space-y-0.5 pt-2 border-t border-gray-200">
                    <div>Subtotal: <strong className="text-text-primary">{formatCLP(p.subtotal)}</strong></div>
                    <div>IVA: <strong className="text-text-primary">{formatCLP(p.iva)}</strong></div>
                    <div className="text-sm pt-1">Total: <strong className="text-success">{formatCLP(p.total)}</strong></div>
                  </div>

                  {p.observaciones && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-2xs uppercase font-semibold text-text-secondary mb-1">Observaciones</p>
                      <p className="text-xs italic text-text-primary">{p.observaciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-text-tertiary">
            Sin cotizaciones
          </div>
        )}
      </div>
    </div>
  );
}
