import Link from 'next/link';
import { Package, FileText, Star, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { formatCLP } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: totalProductos },
    { count: destacados },
    { count: presupuestosMes },
    { data: ultimosPresupuestos },
    { data: totales }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('destacado', true).eq('activo', true),
    supabase.from('presupuestos').select('*', { count: 'exact', head: true }).gte('fecha', monthStart.toISOString()),
    supabase.from('presupuestos').select('id, fecha, cliente_nombre, total, estado').order('fecha', { ascending: false }).limit(8),
    supabase.from('presupuestos').select('total').gte('fecha', monthStart.toISOString())
  ]);

  const ventasPotenciales = (totales ?? []).reduce((s: number, p: any) => s + (p.total ?? 0), 0);

  const cards = [
    { label: 'Productos activos',    value: totalProductos ?? 0, icon: Package },
    { label: 'Destacados',           value: destacados ?? 0,     icon: Star },
    { label: 'Cotizaciones del mes', value: presupuestosMes ?? 0, icon: FileText },
    { label: 'Total cotizado mes',   value: formatCLP(ventasPotenciales), icon: TrendingUp }
  ];

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1 className="uppercase text-2xl sm:text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="text-text-secondary mt-1 text-sm">Vista general de Nexo Sur.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white border-2 border-ink-900 p-4 sm:p-5 min-w-0">
              <Icon className="w-6 h-6 text-brand-500 mb-3" />
              <p className="text-xl sm:text-2xl font-bold text-ink-900 leading-none break-words">
                {c.value}
              </p>
              <p className="text-2xs sm:text-xs uppercase tracking-wider text-text-secondary mt-2">
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border-2 border-ink-900">
        <div className="px-4 sm:px-5 py-3 border-b-2 border-ink-900 flex items-center justify-between gap-3">
          <h2 className="uppercase text-ink-900 font-bold text-sm sm:text-base">
            Últimas cotizaciones
          </h2>
          <Link
            href="/admin/presupuestos"
            className="text-2xs sm:text-xs uppercase tracking-wider text-brand-700 hover:underline shrink-0 font-semibold"
          >
            Ver todas
          </Link>
        </div>

        {/* Tabla desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-sub text-text-secondary">
              <tr>
                <th className="text-left p-3 uppercase text-xs font-semibold">Fecha</th>
                <th className="text-left p-3 uppercase text-xs font-semibold">Cliente</th>
                <th className="text-right p-3 uppercase text-xs font-semibold">Total</th>
                <th className="text-left p-3 uppercase text-xs font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(ultimosPresupuestos ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-text-tertiary">
                    Aún no hay cotizaciones
                  </td>
                </tr>
              )}
              {(ultimosPresupuestos ?? []).map((p: any) => (
                <tr key={p.id} className="border-t border-ink-900/10">
                  <td className="p-3 whitespace-nowrap text-text-secondary">
                    {new Date(p.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td className="p-3 text-text-primary">{p.cliente_nombre ?? '—'}</td>
                  <td className="p-3 text-right font-semibold whitespace-nowrap text-text-primary">
                    {formatCLP(p.total)}
                  </td>
                  <td className="p-3">
                    <span className="inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 border-2 border-ink-900 text-ink-900">
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lista mobile */}
        <div className="md:hidden divide-y divide-ink-900/10">
          {(ultimosPresupuestos ?? []).length === 0 && (
            <p className="p-6 text-center text-sm text-text-tertiary">
              Aún no hay cotizaciones
            </p>
          )}
          {(ultimosPresupuestos ?? []).map((p: any) => (
            <div key={p.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink-900 truncate">
                  {p.cliente_nombre ?? '—'}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {new Date(p.fecha).toLocaleDateString('es-CL')}
                </p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="font-semibold text-sm text-ink-900 whitespace-nowrap">
                  {formatCLP(p.total)}
                </p>
                <span className="inline-block text-[10px] uppercase font-semibold px-1.5 py-0.5 border-2 border-ink-900 text-ink-900">
                  {p.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
