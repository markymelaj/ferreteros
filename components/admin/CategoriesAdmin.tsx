'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Tags, GripVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import type { Category } from '@/lib/types';

const EMPTY: Partial<Category> = { slug: '', nombre: '', icono: '', orden: 0, activo: true };

const ICON_HINTS = ['HardHat', 'Zap', 'Droplet', 'Wrench', 'Paintbrush', 'Sprout', 'Box'];

export function CategoriesAdmin({ initial }: { initial: Category[] }) {
  const [items, setItems] = useState<Category[]>(initial);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const slugify = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload = {
      slug: editing.slug || slugify(editing.nombre ?? ''),
      nombre: editing.nombre,
      icono: editing.icono || null,
      orden: Number(editing.orden) || 0,
      activo: editing.activo !== false
    };
    if (editing.id) {
      const { data, error } = await supabase.from('categories').update(payload).eq('id', editing.id).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => prev.map((c) => c.id === editing.id ? (data as Category) : c).sort((a, b) => a.orden - b.orden));
    } else {
      const { data, error } = await supabase.from('categories').insert(payload).select().single();
      if (error) { alert(error.message); setSaving(false); return; }
      setItems((prev) => [...prev, data as Category].sort((a, b) => a.orden - b.orden));
    }
    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(c: Category) {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"? Los productos asociados perderán su categoría (no se eliminan).`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', c.id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function toggleActivo(id: string, value: boolean) {
    const { error } = await supabase.from('categories').update({ activo: value }).eq('id', id);
    if (error) { alert(error.message); return; }
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, activo: value } : c));
  }

  return (
    <div>
      <header className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Categorías</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            <Tags className="w-3.5 h-3.5 inline mr-1" />
            {items.length} categoría{items.length === 1 ? '' : 's'}
          </p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </header>

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-sub text-text-secondary text-xs uppercase">
            <tr>
              <th className="text-left p-3 font-semibold w-16">Orden</th>
              <th className="text-left p-3 font-semibold">Nombre</th>
              <th className="text-left p-3 font-semibold">Slug</th>
              <th className="text-left p-3 font-semibold">Icono</th>
              <th className="text-center p-3 font-semibold">Activo</th>
              <th className="text-right p-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-bg-hover">
                <td className="p-3 text-text-tertiary font-mono">{c.orden}</td>
                <td className="p-3 font-semibold text-text-primary">{c.nombre}</td>
                <td className="p-3 font-mono text-xs text-text-secondary">{c.slug}</td>
                <td className="p-3 text-xs text-text-secondary">{c.icono ?? '—'}</td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={c.activo}
                    onChange={(e) => toggleActivo(c.id, e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing(c)}
                    className="text-text-link hover:text-blue-700 mr-2 p-1.5 hover:bg-blue-50 rounded transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="text-danger hover:text-red-700 p-1.5 hover:bg-red-50 rounded transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-text-tertiary">Sin categorías</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-2">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-card shadow-card p-3 flex items-start gap-3">
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <GripVertical className="w-4 h-4 text-text-tertiary" />
              <span className="font-mono text-xs text-text-tertiary w-5 text-center">{c.orden}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-text-primary mb-0.5">{c.nombre}</p>
              <p className="text-xs text-text-secondary font-mono mb-1">{c.slug}</p>
              {c.icono && <p className="text-2xs text-text-tertiary">Icono: {c.icono}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={c.activo}
                    onChange={(e) => toggleActivo(c.id, e.target.checked)}
                    className="w-4 h-4 accent-text-link"
                  />
                  <span className="text-text-secondary">Activo</span>
                </label>
                <button onClick={() => setEditing(c)} className="ml-auto text-text-link font-semibold">
                  Editar
                </button>
                <button onClick={() => handleDelete(c)} className="text-danger" aria-label="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white rounded-card shadow-card p-8 text-center text-text-tertiary">
            Sin categorías
          </div>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
          <div
            className="fixed inset-0 bg-ink-900/90 backdrop-blur-sm"
            onClick={() => setEditing(null)}
            aria-hidden="true"
          />
          <div className="relative min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <form
              onSubmit={handleSave}
              className="relative bg-white w-full sm:max-w-md shadow-card-hover min-h-screen sm:min-h-0 sm:rounded-card flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between z-10">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                  {editing.id ? 'Editar' : 'Nueva'} categoría
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

              <div className="flex-1 px-4 sm:px-6 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Nombre *</label>
                  <input className="input" required value={editing.nombre ?? ''} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Slug</label>
                  <input className="input" value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="Auto desde nombre si vacío" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Icono (lucide-react)</label>
                  <input className="input" list="icon-hints" value={editing.icono ?? ''} onChange={(e) => setEditing({ ...editing, icono: e.target.value })} placeholder="Ej: Wrench" />
                  <datalist id="icon-hints">
                    {ICON_HINTS.map((i) => <option key={i} value={i} />)}
                  </datalist>
                  <p className="text-2xs text-text-tertiary mt-1">
                    Sugeridos: {ICON_HINTS.join(', ')}.{' '}
                    <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-text-link hover:underline">
                      Ver catálogo
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">Orden de aparición</label>
                  <input type="number" className="input" value={editing.orden ?? 0} onChange={(e) => setEditing({ ...editing, orden: Number(e.target.value) })} />
                  <p className="text-2xs text-text-tertiary mt-1">
                    Menor número = aparece antes en el menú.
                  </p>
                </div>
                <label className="flex items-center gap-2 font-medium text-text-primary text-sm">
                  <input type="checkbox" checked={editing.activo !== false} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4 accent-text-link" />
                  Activo (visible en web)
                </label>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 flex gap-2 justify-end">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
