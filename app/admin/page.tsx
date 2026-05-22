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
      <header className="mb-8">
        <h1 className="font-display uppercase text-3xl text-navy">Dashboard</h1>
        <p className="text-navy/70 mt-1">Vista general de Nexo Sur.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white border-2 border-navy p-5">
              <Icon className="w-6 h-6 text-ember mb-3" />
              <p className="font-display text-2xl text-navy leading-none">{c.value}</p>
              <p className="text-xs uppercase font-display tracking-wider text-navy/60 mt-2">
                {c.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border-2 border-navy">
        <div className="px-5 py-3 border-b-2 border-navy flex items-center justify-between">
          <h2 className="font-display uppercase text-navy">Últimas cotizaciones</h2>
          <Link href="/admin/presupuestos" className="text-xs uppercase font-display tracking-wider text-ember hover:underline">
            Ver todas
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-sand text-navy">
            <tr>
              <th className="text-left p-3 font-display uppercase text-xs">Fecha</th>
              <th className="text-left p-3 font-display uppercase text-xs">Cliente</th>
              <th className="text-right p-3 font-display uppercase text-xs">Total</th>
              <th className="text-left p-3 font-display uppercase text-xs">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(ultimosPresupuestos ?? []).length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-navy/50">Aún no hay cotizaciones</td></tr>
            )}
            {(ultimosPresupuestos ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-navy/10">
                <td className="p-3">{new Date(p.fecha).toLocaleDateString('es-CL')}</td>
                <td className="p-3">{p.cliente_nombre ?? '—'}</td>
                <td className="p-3 text-right font-semibold">{formatCLP(p.total)}</td>
                <td className="p-3">
                  <span className="inline-block text-[10px] uppercase font-display px-1.5 py-0.5 border-2 border-navy">
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
