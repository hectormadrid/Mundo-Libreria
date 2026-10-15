import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../hooks/useSession';
import { ErrorState, PageLoader } from './ui';

/** Páginas que requieren un cliente con sesión iniciada. */
export function RequireUser({ children }: { children: ReactNode }) {
  const { data: session, isPending, error, refetch } = useSession();
  const location = useLocation();

  if (isPending) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!session.user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
}

/** Páginas del panel de administración. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { data: session, isPending, error, refetch } = useSession();

  if (isPending) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (!session.admin) return <Navigate to="/admin/login" replace />;
  return children;
}

/** Solo acepta rutas internas como destino tras iniciar sesión (evita redirecciones abiertas). */
export function safeRedirect(value: string | null, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}
