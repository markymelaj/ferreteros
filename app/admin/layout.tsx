import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Package, Tags, Wrench, FileText, Settings as SettingsIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { SignOutButton } from '@/components/admin/SignOutButton';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/productos',   label: 'Productos',    icon: Package },
  { href: '/admin/categorias',  label: 'Categorías',   icon: Tags },
  { href: '/admin/maquinaria',  label: 'Maquinaria',   icon: Wrench },
  { href: '/admin/presupuestos',label: 'Presupuestos', icon: FileText },
  { href: '/admin/settings',    label: 'Settings',     icon: SettingsIcon }
];

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Detectar si estamos en /admin/login para no entrar en loop
  const h = headers();
  const pathname =
    h.get('x-invoke-path') ||
    h.get('x-pathname') ||
    h.get('next-url') ||
    '';
  const isLoginRoute = pathname.includes('/admin/login');

  if (!user) {
    if (isLoginRoute) {
      // Permitir que se renderice el formulario de login sin sidebar
      return <>{children}</>;
    }
    redirect('/admin/login');
  }

  // Verificar que es admin
  const { data: admin } = await supabase
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  if (!admin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h1 className="font-display text-2xl text-navy mb-3">Acceso denegado</h1>
        <p className="text-navy/70 mb-5">
          Tu cuenta <strong>{user.email}</strong> no está autorizada para
          administrar este sitio.
        </p>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-navy text-sand border-2 border-navy p-3 h-fit lg:sticky lg:top-24">
          <p className="text-xs font-display uppercase tracking-wider text-ember mb-2 px-2">
            Admin
          </p>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-display uppercase tracking-wider hover:bg-ember hover:text-navy transition-colors"
                >
                  <Icon className="w-4 h-4" /> {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-sand/20 mt-3 pt-3">
            <p className="text-[11px] text-sand/60 px-2 mb-2 truncate">{user.email}</p>
            <SignOutButton />
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
