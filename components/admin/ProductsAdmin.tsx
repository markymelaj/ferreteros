'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Star, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP } from '@/lib/format';
import { BulkImport } from './BulkImport';
import type { Product, Category, StockEstado, ProductTipo } from '@/lib/types';

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

const EMPTY: Partial<Product> = {
  sku: '',
  slug: '',
  nombre: '',
  descripcion: '',
  categoria_id: null,
  precio: 0,
  precio_oferta: null,
  unidad: 'unidad',
  stock_estado: 'disponible',
  destacado: false,
  activo: true,
  tipo: 'producto',
  imagen_url: null
};

export function ProductsAdmin({ initialProducts, categories }: Props) {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [filterCat, setFilterCat] = useState<string>('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const filtered = items.filter((p) => {
    if (filterCat && p.categoria_id !== filterCat) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  async function toggleField(id: string, field: 'destacado' | 'activo', value: boolean) {
    const { error } = await supabase.from('products').update({ [field]: value }).eq('id', id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.filter((x) => x.id !== p.id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload: any = {
      sku: editing.sku || null,
      slug: editing.slug || slugify(editing.nombre ?? ''),
      nombre: editing.nombre,
      descripcion: editing.descripcion || null,
      categoria_id: editing.categoria_id || null,
      precio: Number(editing.precio) || 0,
      precio_oferta: editing.precio_oferta ? Number(editing.precio_oferta) : null,
      unidad: editing.unidad || 'unidad',
      stock_estado: editing.stock_estado || 'disponible',
      destacado: !!editing.destacado,
      activo: !!editing.activo,
      tipo: editing.tipo || 'producto',
      imagen_url: editing.imagen_url || null
    };

    if (editing.id) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', editing.id).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => prev.map((p) => p.id === editing.id ? (data as Product) : p));
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => [data as Product, ...prev]);
    }
    setSaving(false);
    setEditing(null);
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="font-display uppercase text-3xl text-navy">Productos</h1>
          <p className="text-navy/70 text-sm">{items.length} en total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setBulkOpen(true)}
            className="btn-outline"
            title="Carga masiva desde CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> Importar CSV
          </button>
          <button onClick={() => setEditing({ ...EMPTY })} className="btn-brutal">
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <select className="input max-w-xs" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white border-2 border-navy overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-sand text-navy">
            <tr>
              <th className="text-left p-3 font-display uppercase text-xs">SKU</th>
              <th className="text-left p-3 font-display uppercase text-xs">Nombre</th>
              <th className="text-left p-3 font-display uppercase text-xs">Tipo</th>
              <th className="text-right p-3 font-display uppercase text-xs">Precio</th>
              <th className="text-right p-3 font-display uppercase text-xs">Oferta</th>
              <th className="text-center p-3 font-display uppercase text-xs">Destacado</th>
              <th className="text-center p-3 font-display uppercase text-xs">Activo</th>
              <th className="text-right p-3 font-display uppercase text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-navy/10 hover:bg-sand/40">
                <td className="p-3 font-mono text-xs">{p.sku ?? '—'}</td>
                <td className="p-3">
                  <span className="font-semibold text-navy">{p.nombre}</span>
                </td>
                <td className="p-3">
                  <span className="text-[10px] uppercase font-display px-1.5 py-0.5 border border-navy/30">
                    {p.tipo}
                  </span>
                </td>
                <td className="p-3 text-right">{formatCLP(p.precio)}</td>
                <td className="p-3 text-right text-ember">{p.precio_oferta ? formatCLP(p.precio_oferta) : '—'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleField(p.id, 'destacado', !p.destacado)} aria-label="Toggle destacado">
                    <Star className={`w-5 h-5 ${p.destacado ? 'fill-ember text-ember' : 'text-navy/30'}`} />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={p.activo}
                    onChange={(e) => toggleField(p.id, 'activo', e.target.checked)}
                    className="w-4 h-4 accent-ember"
                  />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="text-navy hover:text-ember mr-2" aria-label="Editar">
                    <Pencil className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800" aria-label="Eliminar">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-navy/50">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-navy/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-sand border-2 border-navy max-w-2xl w-full p-6 shadow-brutal my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display uppercase text-2xl text-navy">
                {editing.id ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">SKU</label>
                <input className="input" value={editing.sku ?? ''} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
              </div>
              <div>
                <label className="label">Slug (URL)</label>
                <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto desde nombre si vacío" />
              </div>
              <div className="col-span-2">
                <label className="label">Nombre *</label>
                <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Descripción</label>
                <textarea className="input min-h-[80px]" value={editing.descripcion ?? ''} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} />
              </div>
              <div>
                <label className="label">Categoría</label>
                <select className="input" value={editing.categoria_id ?? ''} onChange={(e) => setEditing({ ...editing, categoria_id: e.target.value || null })}>
                  <option value="">— Sin categoría —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={editing.tipo ?? 'producto'} onChange={(e) => setEditing({ ...editing, tipo: e.target.value as ProductTipo })}>
                  <option value="producto">Producto</option>
                  <option value="arido">Árido</option>
                </select>
              </div>
              <div>
                <label className="label">Precio (CLP) *</label>
                <input type="number" className="input" required value={editing.precio ?? 0} onChange={(e) => setEditing({ ...editing, precio: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Precio oferta</label>
                <input type="number" className="input" value={editing.precio_oferta ?? ''} onChange={(e) => setEditing({ ...editing, precio_oferta: e.target.value ? Number(e.target.value) : null })} />
              </div>
              <div>
                <label className="label">Unidad</label>
                <input className="input" value={editing.unidad ?? 'unidad'} onChange={(e) => setEditing({ ...editing, unidad: e.target.value })} />
              </div>
              <div>
                <label className="label">Estado de stock</label>
                <select className="input" value={editing.stock_estado ?? 'disponible'} onChange={(e) => setEditing({ ...editing, stock_estado: e.target.value as StockEstado })}>
                  <option value="disponible">Disponible</option>
                  <option value="bajo_stock">Bajo stock</option>
                  <option value="sin_stock">Sin stock</option>
                  <option value="consultar">Consultar</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">URL imagen (opcional)</label>
                <input className="input" placeholder="https://…" value={editing.imagen_url ?? ''} onChange={(e) => setEditing({ ...editing, imagen_url: e.target.value })} />
              </div>
              <label className="col-span-1 flex items-center gap-2 font-semibold text-navy">
                <input type="checkbox" checked={!!editing.destacado} onChange={(e) => setEditing({ ...editing, destacado: e.target.checked })} className="w-4 h-4 accent-ember" />
                Destacado en home
              </label>
              <label className="col-span-1 flex items-center gap-2 font-semibold text-navy">
                <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-ember" />
                Activo (visible)
              </label>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-brutal">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {bulkOpen && (
        <BulkImport
          categories={categories}
          onClose={() => setBulkOpen(false)}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}
