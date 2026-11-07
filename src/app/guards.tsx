import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Role } from '@/graphql/generated/graphql';
import { PageSkeleton } from '@/components/feedback/LoadingSkeleton';
import { homePathFor } from '@/components/layout/navItems';
import ForbiddenPage from '@/features/errors/ForbiddenPage';
import { useAuth } from './providers/AuthProvider';

/** Giriş zorunlu. `roles` verilirse yetkisiz kullanıcı 403 görür (backend yine kontrol eder). */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { initializing, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();
  if (initializing) return <PageSkeleton />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (roles && !hasRole(...roles)) return <ForbiddenPage />;
  return children;
}

/** Sadece misafir (login/register). Giriş yapmışsa ana sayfaya. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { initializing, isAuthenticated } = useAuth();
  if (initializing) return <PageSkeleton />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

const LandingPage = lazy(() => import('@/features/landing/LandingPage'));

/** `/`: misafire karşılama sayfası, giriş yapmışa rolünün ana sayfası. */
export function HomeGate() {
  const { initializing, isAuthenticated } = useAuth();
  if (initializing) return <PageSkeleton />;
  if (isAuthenticated) return <HomeRedirect />;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LandingPage />
    </Suspense>
  );
}

export function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user?.role)} replace />;
}

/** Eski adresi (sorgu parametreleriyle) yeni adrese taşır, ör. `/drivers?q=a` → `/settings/network/drivers?q=a`. */
export function MovedTo({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={to + search} replace />;
}

/**
 * Araçlar: DRIVER kendi "Araçlarım" sayfasını burada görür; OPERATOR/ADMIN/STAFF için sayfa
 * Settings > Vehicles altına taşındı.
 */
export function VehiclesRoute({ children }: { children: ReactNode }) {
  const { hasRole } = useAuth();
  return hasRole('DRIVER') ? children : <MovedTo to="/settings/vehicles/list" />;
}
