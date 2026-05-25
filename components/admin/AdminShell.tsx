'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package, Tags, Wrench, FileText, Settings as SettingsIcon,
  LayoutDashboard, Menu, X, ChevronLeft
} from 'lucide-react';
import { SignOutButton } from '@/components/admin/SignOutButton';

const NAV = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/productos',    label: 'Productos',    icon: Package },
  { href: '/admin/categorias',   label: 'Categorías',   icon: Tags },
  { href: '/admin/maquinaria',   label: 'Maquinaria',   icon: Wrench },
  { href: '/admin/presupuestos', label: 'Presupuestos', icon: FileText },
  { href: '/admin/settings',     label: 'Settings',     icon: SettingsIcon }
];

export function AdminShell({
  email,
  children
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentLabel =
    NAV.find((n) =>
      n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
    )?.label ?? 'Admin';

  function closeDrawer() {
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-bg-page">
      {/* Top bar (siempre visible) */}
      <header className="bg-ink-900 text-white sticky top-0 z-30 shadow-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/admin" className="font-bold text-base truncate">
              Admin <span className="text-brand-500">·</span>{' '}
              <span className="text-white/70 font-normal">{currentLabel}</span>
            </Link>
          </div>
          <Link
            href="/"
            className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Ir al sitio
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <nav className="bg-white rounded-card shadow-card p-2 sticky top-20">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active =
                n.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                    active
                      ? 'bg-ink-900 text-white'
                      : 'text-text-primary hover:bg-bg-sub'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {n.label}
                </Link>
              );
            })}
            <div className="border-t border-gray-100 mt-2 pt-2 px-3">
              <p className="text-2xs text-text-tertiary mb-2 truncate" title={email}>
                {email}
              </p>
              <SignOutButton />
            </div>
          </nav>
        </aside>

        {/* Drawer mobile */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col">
              <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200">
                <p className="font-bold text-text-primary">Menú</p>
                <button
                  onClick={closeDrawer}
                  className="p-2 -mr-2 hover:bg-bg-sub rounded transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5 text-text-primary" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-2">
                {NAV.map((n) => {
                  const Icon = n.icon;
                  const active =
                    n.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(n.href);
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded transition-colors ${
                        active
                          ? 'bg-ink-900 text-white'
                          : 'text-text-primary hover:bg-bg-sub'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {n.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-gray-200 p-3">
                <p className="text-xs text-text-secondary mb-2 truncate" title={email}>
                  {email}
                </p>
                <SignOutButton />
              </div>
            </aside>
          </div>
        )}

        {/* Contenido */}
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
