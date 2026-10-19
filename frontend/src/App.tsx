import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router';
import { MapPinOff } from 'lucide-react';
import { StoreLayout } from './components/store/StoreLayout';
import { RequireAdmin, RequireUser } from './components/guards';
import { EmptyState, PageLoader } from './components/ui';
import { HomePage } from './pages/store/HomePage';
import { ProductPage } from './pages/store/ProductPage';
import { ContactPage } from './pages/store/ContactPage';
import { CartPage } from './pages/store/CartPage';
import { CheckoutPage } from './pages/store/CheckoutPage';
import { OrdersPage } from './pages/store/OrdersPage';
import { OrderDetailPage } from './pages/store/OrderDetailPage';
import { ProfilePage } from './pages/store/ProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// El panel de administración se descarga solo cuando se visita.
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const OrdersAdminPage = lazy(() => import('./pages/admin/OrdersAdminPage').then((m) => ({ default: m.OrdersAdminPage })));
const UsersAdminPage = lazy(() => import('./pages/admin/UsersAdminPage').then((m) => ({ default: m.UsersAdminPage })));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const FamiliesPage = lazy(() => import('./pages/admin/FamiliesPage').then((m) => ({ default: m.FamiliesPage })));
const BarcodesPage = lazy(() => import('./pages/admin/BarcodesPage').then((m) => ({ default: m.BarcodesPage })));
const AdminsPage = lazy(() => import('./pages/admin/AdminsPage').then((m) => ({ default: m.AdminsPage })));

function NotFoundPage() {
  return (
    <EmptyState icon={<MapPinOff className="mx-auto h-16 w-16" />} title="Página no encontrada">
      <p className="mb-6 text-gray-500">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn-primary">
        Ir al inicio
      </Link>
    </EmptyState>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<StoreLayout />}>
            <Route index element={<HomePage />} />
            <Route path="producto/:id" element={<ProductPage />} />
            <Route path="contacto" element={<ContactPage />} />
            <Route path="carrito" element={<RequireUser><CartPage /></RequireUser>} />
            <Route path="checkout" element={<RequireUser><CheckoutPage /></RequireUser>} />
            <Route path="mis-pedidos" element={<RequireUser><OrdersPage /></RequireUser>} />
            <Route path="mis-pedidos/:id" element={<RequireUser><OrderDetailPage /></RequireUser>} />
            <Route path="perfil" element={<RequireUser><ProfilePage /></RequireUser>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="recuperar" element={<ForgotPasswordPage />} />
          <Route path="restablecer" element={<ResetPasswordPage />} />

          {/* Enlace antiguo: el acceso al panel es el mismo login de la tienda. */}
          <Route path="admin/login" element={<Navigate to="/login" replace />} />
          <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
            <Route path="pedidos" element={<OrdersAdminPage />} />
            <Route path="usuarios" element={<UsersAdminPage />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="familias" element={<FamiliesPage />} />
            <Route path="codigos" element={<BarcodesPage />} />
            <Route path="administradores" element={<AdminsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
