import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { Layout } from './shared/components/Layout';
import { AuthLayout } from './shared/components/AuthLayout';
import { AdminLayout } from './features/admin/components/AdminLayout';
import { PageLoader } from './shared/components/PageLoader';
import HomePage from './pages/home/HomePage';
import VehicleCatalogPage from './pages/VehicleCatalogPage';
import ContactPage from './pages/ContactPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyRentalsPage from './pages/MyRentalsPage';
import ReservarPage from './pages/reservar/ReservarPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

/* oxlint-disable react/only-export-components -- router.tsx exporta una config, no componentes: Fast Refresh no aplica. */
// El panel carga bajo demanda: recharts (dependencia del dashboard) nunca
// debe entrar al bundle del sitio público.
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminVehiclesPage = lazy(() => import('./pages/admin/AdminVehiclesPage'));
const AdminVehicleNewPage = lazy(() => import('./pages/admin/AdminVehicleNewPage'));
const AdminVehicleEditPage = lazy(() => import('./pages/admin/AdminVehicleEditPage'));
const AdminClientsPage = lazy(() => import('./pages/admin/AdminClientsPage'));
const AdminRentalsPage = lazy(() => import('./pages/admin/AdminRentalsPage'));
const AdminCatalogPage = lazy(() => import('./pages/admin/AdminCatalogPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalogo', element: <VehicleCatalogPage /> },
      { path: '/contacto', element: <ContactPage /> },
      { path: '/carros/:id', element: <VehicleDetailPage /> },
      {
        path: '/mis-rentas',
        element: (
          <ProtectedRoute requiredRole="client">
            <MyRentalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/reservar',
        element: (
          <ProtectedRoute requiredRole="client">
            <ReservarPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
  // El panel vive fuera de Layout a propósito: el header de cliente, el
  // footer de marketing y el widget de FAQs no aplican a una herramienta
  // interna. AdminLayout monta su propio header.
  {
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminDashboardPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/vehiculos',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminVehiclesPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/vehiculos/nuevo',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminVehicleNewPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/vehiculos/:id/editar',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminVehicleEditPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/clientes',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminClientsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/rentas',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminRentalsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/catalogo',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminCatalogPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/usuarios',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminUsersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/reportes',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}>
              <AdminReportsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
  // Top-level y fuera de AdminLayout: el login de admin no lleva header.
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/login/admin', element: <Navigate to="/admin/login" replace /> },
]);
