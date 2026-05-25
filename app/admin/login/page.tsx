'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/admin');
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (msg.includes('email not confirmed')) {
        setError('El correo aún no está confirmado. Confírmalo desde Supabase.');
      } else {
        setError(error.message);
      }
      setSubmitting(false);
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo/header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-ink-900 rounded-full mb-3">
            <ShieldCheck className="w-7 h-7 text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            Panel de Administración
          </h1>
          <p className="text-sm text-text-secondary">
            Acceso restringido. Ingresa tus credenciales.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-card shadow-card p-5 sm:p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.cl"
                className="w-full bg-white border border-gray-300 rounded px-3 py-3 pl-10 text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-link focus:ring-2 focus:ring-text-link/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 rounded px-3 py-3 pl-10 text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-link focus:ring-2 focus:ring-text-link/30 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-danger font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 disabled:opacity-60 disabled:cursor-wait text-white font-semibold py-3 px-4 rounded transition-colors text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Ingresar
              </>
            )}
          </button>

          <p className="text-2xs text-text-tertiary text-center pt-1">
            Si olvidaste tu contraseña, contacta al administrador.
          </p>
        </form>
      </div>
    </div>
  );
}
