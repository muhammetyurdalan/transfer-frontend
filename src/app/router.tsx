import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import type { Role } from '@/graphql/generated/graphql';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import ErrorBoundaryPage from '@/features/errors/ErrorBoundaryPage';
import NotFoundPage from '@/features/errors/NotFoundPage';
import { AuthProvider } from './providers/AuthProvider';
import { SubscriptionProvider } from './providers/SubscriptionProvider';
import { GuestOnly, HomeRedirect, RequireAuth } from './guards';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const TransferListPage = lazy(() => import('@/features/transfers/TransferListPage'));
const CreateTransferPage = lazy(() => import('@/features/transfers/CreateTransferPage'));
const SelectVehiclePage = lazy(() => import('@/features/transfers/SelectVehiclePage'));
const TransferDetailPage = lazy(() => import('@/features/transfers/TransferDetailPage'));
const EditTransferPage = lazy(() => import('@/features/transfers/EditTransferPage'));
const DispatchPage = lazy(() => import('@/features/transfers/DispatchPage'));
const JobsPage = lazy(() => import('@/features/transfers/JobsPage'));
const VehiclesPage = lazy(() => import('@/features/vehicles/VehiclesPage'));
const VehicleCategoriesPage = lazy(() => import('@/features/vehicles/VehicleCategoriesPage'));
const UsersPage = lazy(() => import('@/features/users/UsersPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const MessagesPage = lazy(() => import('@/features/messages/MessagesPage'));

const STAFF: Role[] = ['ADMIN', 'STAFF'];
const OPERATIONS: Role[] = ['OPERATOR', 'ADMIN', 'STAFF'];
const PARTICIPANTS: Role[] = ['CUSTOMER', 'DRIVER', 'OPERATOR'];

function Root() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Outlet />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

const guard = (element: React.ReactNode, roles?: Role[]) => <RequireAuth roles={roles}>{element}</RequireAuth>;

/** Route tablosu (§7). Sayfalar lazy yüklenir, layout'lardaki Suspense skeleton gösterir. */
export const router = createBrowserRouter([
  {
    element: <Root />,
    // Layout dışı (provider, layout, auth sayfaları) hatalar: tam sayfa
    errorElement: <ErrorBoundaryPage fullPage />,
    children: [
      {
        element: (
          <GuestOnly>
            <AuthLayout />
          </GuestOnly>
        ),
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      // Şifre sıfırlama profil sayfasından da açılır, bu yüzden misafir şartı yok.
      { element: <AuthLayout />, children: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }] },
      {
        element: guard(<AppLayout />),
        children: [
          {
            // Sayfa hataları header/menü korunarak içerik alanında gösterilir
            errorElement: <ErrorBoundaryPage />,
            children: [
              { path: '/', element: <HomeRedirect /> },
              { path: '/transfers', element: <TransferListPage /> },
              { path: '/transfers/new', element: guard(<CreateTransferPage />, ['CUSTOMER']) },
              { path: '/transfers/:id', element: <TransferDetailPage /> },
              { path: '/transfers/:id/vehicle', element: guard(<SelectVehiclePage />, ['CUSTOMER']) },
              { path: '/transfers/:id/edit', element: guard(<EditTransferPage />, ['CUSTOMER']) },
              { path: '/dispatch', element: guard(<DispatchPage />, OPERATIONS) },
              { path: '/jobs', element: guard(<JobsPage />, ['DRIVER']) },
              { path: '/messages', element: guard(<MessagesPage />, PARTICIPANTS) },
              { path: '/messages/:transferId', element: guard(<MessagesPage />, PARTICIPANTS) },
              { path: '/vehicles', element: guard(<VehiclesPage />, [...OPERATIONS, 'DRIVER']) },
              { path: '/vehicle-categories', element: guard(<VehicleCategoriesPage />, STAFF) },
              { path: '/users', element: guard(<UsersPage />, STAFF) },
              { path: '/settings', element: <Navigate to="/settings/profile" replace /> },
              { path: '/settings/:tab', element: <SettingsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
