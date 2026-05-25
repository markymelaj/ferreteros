import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase-server';
import { SignOutButton } from '@/components/admin/SignOutButton';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Detectar /admin/login para no entrar en loop
  const h = headers();
  const pathname =
    h.get('x-invoke-path') ||
    h.get('x-pathname') ||
    h.get('next-url') ||
    '';
  const isLoginRoute = pathname.includes('/admin/login');

  if (!user) {
    if (isLoginRoute) return <>{children}</>;
    redirect('/admin/login');
  }

  // Verificar admin
  const { data: admin } = await supabase
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .maybeSingle();

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page p-4">
        <div className="bg-white rounded-card shadow-card max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Acceso denegado
          </h1>
          <p className="text-text-secondary mb-5 text-sm">
            Tu cuenta <strong>{user.email}</strong> no está autorizada para
            administrar este sitio.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  return <AdminShell email={user.email ?? ''}>{children}</AdminShell>;
}
