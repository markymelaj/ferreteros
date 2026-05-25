'use client';

import { useState, useMemo } from 'react';
import {
  Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2,
  Loader2, Download, Trash2
} from 'lucide-react';
import type { Category, ProductTipo, StockEstado } from '@/lib/types';

interface Props {
  categories: Category[];
  onClose: () => void;
  onDone: () => void;
}

/** Columnas esperadas (en español, orden importa). */
const COLUMNS = [
  'sku',
  'nombre',
  'descripcion',
  'categoria_slug',
  'tipo',          // producto | arido
  'precio',
  'precio_oferta',
  'unidad',
  'stock_estado',  // disponible | bajo_stock | sin_stock | consultar
  'destacado',     // si | no
  'activo',        // si | no
  'imagen_url'
] as const;

const TEMPLATE_HEADER = COLUMNS.join(',');
const TEMPLATE_ROW =
  'FS-031,Cinta Aisladora Negra 20m,"Cinta aisladora PVC 20m",electrico,producto,890,,unidad,disponible,no,si,';

type ParsedRow = {
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
};

type ImportState =
  | { kind: 'parsing' }
  | { kind: 'preview'; rows: ParsedRow[] }
  | { kind: 'submitting' }
  | { kind: 'done'; inserted: number; updated: number; failed: number }
  | { kind: 'error'; message: string };

const VALID_TIPOS: ProductTipo[] = ['producto', 'arido'];
const VALID_STOCK: StockEstado[] = ['disponible', 'bajo_stock', 'sin_stock', 'consultar'];

export function BulkImport({ categories, onClose, onDone }: Props) {
  const [raw, setRaw] = useState('');
  const [state, setState] = useState<ImportState | null>(null);

  const validSlugs = useMemo(
    () => new Set(categories.map((c) => c.slug)),
    [categories]
  );

  function downloadTemplate() {
    const sample = [
      TEMPLATE_HEADER,
      TEMPLATE_ROW,
      // Un ejemplo de árido
      'AR-008,Arena Estabilizada,Mezcla árida ya estabilizada,construccion,arido,23000,,m³,disponible,no,si,'
    ].join('\n');
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-productos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const text = await f.text();
    setRaw(text);
  }

  function parseCSV(text: string): ParsedRow[] {
    // Parser simple: maneja comillas dobles y separador coma
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
    if (lines.length === 0) return [];

    const splitCSVLine = (line: string): string[] => {
      const out: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') { inQuotes = !inQuotes; }
        else if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
        else { cur += c; }
      }
      out.push(cur);
      return out.map((x) => x.trim());
    };

    const header = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i]);
      const data: Record<string, string> = {};
      header.forEach((h, idx) => {
        data[h] = (cells[idx] ?? '').trim();
      });

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validaciones
      if (!data.nombre) errors.push('Falta nombre');
      if (!data.precio || isNaN(Number(data.precio)) || Number(data.precio) <= 0) {
        errors.push('Precio inválido');
      }
      if (data.precio_oferta && (isNaN(Number(data.precio_oferta)) || Number(data.precio_oferta) <= 0)) {
        errors.push('Precio oferta inválido');
      }
      if (data.precio_oferta && Number(data.precio_oferta) >= Number(data.precio)) {
        warnings.push('Precio oferta ≥ precio normal');
      }
      const tipo = (data.tipo || 'producto').toLowerCase();
      if (!VALID_TIPOS.includes(tipo as ProductTipo)) {
        errors.push(`Tipo inválido (${data.tipo}). Usa: producto | arido`);
      }
      const stock = (data.stock_estado || 'disponible').toLowerCase();
      if (!VALID_STOCK.includes(stock as StockEstado)) {
        errors.push(`Stock estado inválido. Usa: ${VALID_STOCK.join(' | ')}`);
      }
      if (data.categoria_slug && !validSlugs.has(data.categoria_slug)) {
        warnings.push(`Categoría "${data.categoria_slug}" no existe → quedará sin categoría`);
      }
      if (data.imagen_url && !/^https?:\/\//.test(data.imagen_url)) {
        warnings.push('imagen_url no parece URL válida (debe iniciar con http)');
      }

      rows.push({ data, errors, warnings });
    }
    return rows;
  }

  function startPreview() {
    if (!raw.trim()) return;
    setState({ kind: 'parsing' });
    setTimeout(() => {
      try {
        const rows = parseCSV(raw);
        if (rows.length === 0) {
          setState({ kind: 'error', message: 'CSV vacío o sin filas válidas' });
          return;
        }
        setState({ kind: 'preview', rows });
      } catch (err: any) {
        setState({ kind: 'error', message: err.message });
      }
    }, 100);
  }

  async function submitImport() {
    if (!state || state.kind !== 'preview') return;
    const okRows = state.rows.filter((r) => r.errors.length === 0);
    if (okRows.length === 0) {
      setState({ kind: 'error', message: 'No hay filas válidas para importar' });
      return;
    }
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rows: okRows.map((r) => r.data) })
      });
      const json = await res.json();
      if (!res.ok) {
        setState({ kind: 'error', message: json.error || 'Error en servidor' });
        return;
      }
      setState({
        kind: 'done',
        inserted: json.inserted ?? 0,
        updated: json.updated ?? 0,
        failed: json.failed ?? 0
      });
    } catch (err: any) {
      setState({ kind: 'error', message: err.message });
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-card max-w-4xl w-full shadow-card-hover my-8">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-text-link" />
            <h2 className="text-lg font-bold text-text-primary">Importar productos desde CSV</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-text-secondary hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-5">
          {/* PASO 1: pegar o subir CSV */}
          {(!state || state.kind === 'error' || state.kind === 'parsing') && (
            <>
              <div className="bg-bg-sub rounded p-3 mb-4 text-xs text-text-secondary">
                <p className="font-semibold text-text-primary mb-1">Columnas esperadas (en orden):</p>
                <p className="font-mono break-all">{COLUMNS.join(', ')}</p>
                <p className="mt-2">
                  <strong>tipo:</strong> producto | arido &nbsp;·&nbsp;
                  <strong>stock_estado:</strong> disponible | bajo_stock | sin_stock | consultar &nbsp;·&nbsp;
                  <strong>destacado/activo:</strong> si | no
                </p>
                <p className="mt-1">
                  <strong>categoria_slug:</strong> {categories.map((c) => c.slug).join(' | ')}
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 text-text-link hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar plantilla con ejemplos
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <label className="btn-outline cursor-pointer flex-1 sm:flex-none">
                  <Upload className="w-4 h-4" /> Subir archivo CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
                <span className="self-center text-xs text-text-secondary">o pega el CSV abajo:</span>
              </div>

              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={`${TEMPLATE_HEADER}\n${TEMPLATE_ROW}`}
                className="input min-h-[200px] font-mono text-xs"
              />

              {state?.kind === 'error' && (
                <div className="mt-3 rounded border border-danger/30 bg-red-50 p-3 text-sm text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{state.message}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="btn-ghost">Cancelar</button>
                <button
                  onClick={startPreview}
                  disabled={!raw.trim() || state?.kind === 'parsing'}
                  className="btn-primary disabled:opacity-50"
                >
                  {state?.kind === 'parsing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Procesando…
                    </>
                  ) : (
                    'Previsualizar →'
                  )}
                </button>
              </div>
            </>
          )}

          {/* PASO 2: preview */}
          {state?.kind === 'preview' && (
            <PreviewTable
              rows={state.rows}
              onBack={() => setState(null)}
              onSubmit={submitImport}
            />
          )}

          {/* PASO 3: submitting */}
          {state?.kind === 'submitting' && (
            <div className="py-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-text-link mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Importando productos…</p>
            </div>
          )}

          {/* PASO 4: done */}
          {state?.kind === 'done' && (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-lg font-bold text-text-primary mb-2">Importación completa</h3>
              <div className="text-sm text-text-secondary space-y-1 mb-5">
                <p><strong className="text-success">{state.inserted}</strong> productos nuevos creados</p>
                <p><strong className="text-text-link">{state.updated}</strong> productos actualizados (por slug)</p>
                {state.failed > 0 && (
                  <p><strong className="text-danger">{state.failed}</strong> fallaron</p>
                )}
              </div>
              <button
                onClick={() => {
                  onDone();
                  onClose();
                }}
                className="btn-primary"
              >
                Ver productos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewTable({
  rows, onBack, onSubmit
}: {
  rows: ParsedRow[];
  onBack: () => void;
  onSubmit: () => void;
}) {
  const okCount = rows.filter((r) => r.errors.length === 0).length;
  const errCount = rows.length - okCount;
  const warnCount = rows.filter((r) => r.warnings.length > 0).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-text-primary">
          {rows.length} fila{rows.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-success border border-success/30">
          ✓ {okCount} válida{okCount !== 1 ? 's' : ''}
        </span>
        {errCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-danger border border-danger/30">
            ✕ {errCount} con error
          </span>
        )}
        {warnCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-warning border border-warning/30">
            ⚠ {warnCount} con advertencia
          </span>
        )}
      </div>

      <div className="border border-gray-200 rounded overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-bg-sub sticky top-0">
            <tr>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Nombre</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-right p-2">Precio</th>
              <th className="text-left p-2">Categoría</th>
              <th className="text-left p-2">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const ok = r.errors.length === 0;
              return (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-2 whitespace-nowrap">
                    {ok ? (
                      <span className="text-success">✓</span>
                    ) : (
                      <span className="text-danger">✕</span>
                    )}
                  </td>
                  <td className="p-2 font-mono">{r.data.sku || '—'}</td>
                  <td className="p-2">{r.data.nombre || <em className="text-text-tertiary">(sin nombre)</em>}</td>
                  <td className="p-2">{r.data.tipo || 'producto'}</td>
                  <td className="p-2 text-right">{r.data.precio || '—'}</td>
                  <td className="p-2">{r.data.categoria_slug || '—'}</td>
                  <td className="p-2 text-2xs">
                    {r.errors.map((e, j) => (
                      <div key={`e${j}`} className="text-danger">✕ {e}</div>
                    ))}
                    {r.warnings.map((w, j) => (
                      <div key={`w${j}`} className="text-warning">⚠ {w}</div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button onClick={onBack} className="btn-ghost">
          ← Volver
        </button>
        <button
          onClick={onSubmit}
          disabled={okCount === 0}
          className="btn-primary disabled:opacity-50"
        >
          Importar {okCount} producto{okCount !== 1 ? 's' : ''}
        </button>
      </div>
    </>
  );
}
