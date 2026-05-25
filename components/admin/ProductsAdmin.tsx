'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus, Pencil, Trash2, Star, X, Loader2, FileSpreadsheet,
  Package, Mountain, Search
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { formatCLP } from '@/lib/format';
import { BulkImport } from './BulkImport';
import { ImageUploader } from './ImageUploader';
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
  imagen_url: null,
  imagenes_galeria: []
};

export function ProductsAdmin({ initialProducts, categories }: Props) {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const [filterCat, setFilterCat] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<'' | ProductTipo>('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalProductos = items.filter((p) => p.tipo === 'producto').length;
  const totalAridos = items.filter((p) => p.tipo === 'arido').length;

  const filtered = items.filter((p) => {
    if (filterCat && p.categoria_id !== filterCat) return false;
    if (filterTipo && p.tipo !== filterTipo) return false;
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
      imagen_url: editing.imagen_url || null,
      imagenes_galeria: editing.imagenes_galeria ?? []
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
      {/* Header */}
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Productos y Áridos
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> {totalProductos} productos
              </span>
              {' · '}
              <span className="inline-flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" /> {totalAridos} áridos
              </span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setBulkOpen(true)}
              className="btn-outline text-sm"
              title="Carga masiva desde CSV"
            >
              <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Importar</span> CSV
            </button>
            <button
              onClick={() => setEditing({ ...EMPTY, tipo: 'arido', unidad: 'm³' })}
              className="btn-outline text-sm"
              title="Crear árido"
            >
              <Mountain className="w-4 h-4" /> Árido
            </button>
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="space-y-2">
          <div className="flex bg-bg-sub rounded p-1 text-sm">
            <button
              onClick={() => setFilterTipo('')}
              className={`flex-1 px-3 py-2 font-semibold rounded transition-colors ${
                filterTipo === '' ? 'bg-white text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Todos <span className="text-text-tertiary">({items.length})</span>
            </button>
            <button
              onClick={() => setFilterTipo('producto')}
              className={`flex-1 px-3 py-2 font-semibold rounded transition-colors inline-flex items-center justify-center gap-1.5 ${
                filterTipo === 'producto' ? 'bg-white text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Productos <span className="text-text-tertiary">({totalProductos})</span>
            </button>
            <button
              onClick={() => setFilterTipo('arido')}
              className={`flex-1 px-3 py-2 font-semibold rounded transition-colors inline-flex items-center justify-center gap-1.5 ${
                filterTipo === 'arido' ? 'bg-white text-text-primary shadow-card' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              Áridos <span className="text-text-tertiary">({totalAridos})</span>
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 pl-9 text-sm placeholder:text-text-tertiary focus:outline-none focus:border-text-link focus:ring-1 focus:ring-text-link/30"
              />
            </div>
            <select
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-text-link min-w-[150px]"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-sub text-text-secondary text-xs uppercase">
            <tr>
              <th className="text-left p-3 font-semibold">SKU</th>
              <th className="text-left p-3 font-semibold">Nombre</th>
              <th className="text-left p-3 font-semibold">Tipo</th>
              <th className="text-right p-3 font-semibold">Precio</th>
              <th className="text-right p-3 font-semibold">Oferta</th>
              <th className="text-center p-3 font-semibold">Destacado</th>
              <th className="text-center p-3 font-semibold">Activo</th>
              <th className="text-right p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-bg-hover">
                <td className="p-3 font-mono text-xs text-text-secondary">{p.sku ?? '—'}</td>
                <td className="p-3 font-semibold text-text-primary">{p.nombre}</td>
                <td className="p-3">
                  <span className={`text-2xs uppercase font-semibold px-1.5 py-0.5 rounded ${
                    p.tipo === 'arido'
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-ink-50 text-ink-800'
                  }`}>
                    {p.tipo}
                  </span>
                </td>
                <td className="p-3 text-right text-text-primary">{formatCLP(p.precio)}</td>
                <td className="p-3 text-right text-success font-semibold">
                  {p.precio_oferta ? formatCLP(p.precio_oferta) : '—'}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleField(p.id, 'destacado', !p.destacado)} aria-label="Toggle destacado">
                    <Star className={`w-5 h-5 ${p.destacado ? 'fill-brand-500 text-brand-500' : 'text-gray-300'}`} />
                  </button>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={p.activo}
                    onChange={(e) => toggleField(p.id, 'activo', e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-text-link hover:text-blue-700 mr-2 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="text-danger hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-text-tertiary">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-card shadow-card p-3 flex gap-3">
            <div className="w-16 h-16 bg-bg-sub rounded shrink-0 overflow-hidden relative">
              {p.imagen_url ? (
                <Image src={p.imagen_url} alt={p.nombre} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-tertiary text-2xl">
                  {p.nombre.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-mono text-text-tertiary">{p.sku ?? '—'}</p>
                <span className={`text-2xs uppercase font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                  p.tipo === 'arido' ? 'bg-brand-100 text-brand-800' : 'bg-ink-50 text-ink-800'
                }`}>
                  {p.tipo}
                </span>
              </div>
              <p className="font-semibold text-sm text-text-primary line-clamp-2 mb-1">
                {p.nombre}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-text-primary">
                  {formatCLP(p.precio_oferta ?? p.precio)}
                </span>
                {p.precio_oferta && (
                  <span className="text-2xs text-text-tertiary line-through">
                    {formatCLP(p.precio)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <button
                  onClick={() => toggleField(p.id, 'destacado', !p.destacado)}
                  className="inline-flex items-center gap-1"
                >
                  <Star className={`w-4 h-4 ${p.destacado ? 'fill-brand-500 text-brand-500' : 'text-gray-300'}`} />
                  <span className="text-text-secondary">Destacado</span>
                </button>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.activo}
                    onChange={(e) => toggleField(p.id, 'activo', e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                  <span className="text-text-secondary">Activo</span>
                </label>
                <button
                  onClick={() => setEditing(p)}
                  className="ml-auto text-text-link font-semibold"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="text-danger"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-text-tertiary">
            Sin resultados
          </div>
        )}
      </div>

      {/* Modal de edición — opaco real, fullscreen en mobile */}
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
          {/* Backdrop SÓLIDO */}
          <div
            className="fixed inset-0 bg-ink-900/90 backdrop-blur-sm"
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />

          <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <form
              onSubmit={handleSave}
              className="relative bg-white w-full sm:max-w-2xl shadow-card-hover min-h-screen sm:min-h-0 sm:rounded-card flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header sticky */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between z-10">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                  {editing.id ? 'Editar' : 'Nuevo'} {editing.tipo === 'arido' ? 'árido' : 'producto'}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Cerrar"
                  className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-bg-sub rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">SKU</label>
                  <input className="input" value={editing.sku ?? ''} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Slug (URL)</label>
                  <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto desde nombre si vacío" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Nombre *</label>
                  <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Descripción</label>
                  <textarea className="input min-h-[80px]" value={editing.descripcion ?? ''} onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Categoría</label>
                  <select className="input" value={editing.categoria_id ?? ''} onChange={(e) => setEditing({ ...editing, categoria_id: e.target.value || null })}>
                    <option value="">— Sin categoría —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Tipo</label>
                  <select
                    className="input"
                    value={editing.tipo ?? 'producto'}
                    onChange={(e) => {
                      const newTipo = e.target.value as ProductTipo;
                      setEditing({
                        ...editing,
                        tipo: newTipo,
                        unidad: newTipo === 'arido' && (editing.unidad === 'unidad' || !editing.unidad)
                          ? 'm³'
                          : editing.unidad
                      });
                    }}
                  >
                    <option value="producto">Producto</option>
                    <option value="arido">Árido (vendido por m³)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Precio (CLP) *</label>
                  <input type="number" className="input" required value={editing.precio ?? 0} onChange={(e) => setEditing({ ...editing, precio: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Precio oferta</label>
                  <input type="number" className="input" value={editing.precio_oferta ?? ''} onChange={(e) => setEditing({ ...editing, precio_oferta: e.target.value ? Number(e.target.value) : null })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Unidad</label>
                  <input className="input" value={editing.unidad ?? 'unidad'} onChange={(e) => setEditing({ ...editing, unidad: e.target.value })} placeholder="unidad, saco, m³…" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Estado de stock</label>
                  <select className="input" value={editing.stock_estado ?? 'disponible'} onChange={(e) => setEditing({ ...editing, stock_estado: e.target.value as StockEstado })}>
                    <option value="disponible">Disponible</option>
                    <option value="bajo_stock">Bajo stock</option>
                    <option value="sin_stock">Sin stock</option>
                    <option value="consultar">Consultar</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-primary mb-1">Imágenes del producto</label>
                  <ImageUploader
                    value={editing.imagen_url ?? null}
                    onChange={(url) => setEditing({ ...editing, imagen_url: url })}
                    gallery={editing.imagenes_galeria ?? []}
                    onGalleryChange={(urls) => setEditing({ ...editing, imagenes_galeria: urls })}
                  />
                </div>
                <label className="flex items-center gap-2 font-medium text-text-primary text-sm">
                  <input type="checkbox" checked={!!editing.destacado} onChange={(e) => setEditing({ ...editing, destacado: e.target.checked })} className="w-4 h-4 accent-text-link" />
                  Destacado en home
                </label>
                <label className="flex items-center gap-2 font-medium text-text-primary text-sm">
                  <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-text-link" />
                  Activo (visible)
                </label>
              </div>

              {/* Footer sticky */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex gap-2 justify-end">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
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
