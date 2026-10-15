import { useEffect, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { CartDrawerProvider } from '../../context/CartDrawerContext';
import { CartDrawer } from './CartDrawer';
import { CategoryNav } from './CategoryNav';
import { Footer } from './Footer';
import { Header } from './Header';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function StoreLayout() {
  return (
    <CartDrawerProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <Header />
        <CategoryNav />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
    </CartDrawerProvider>
  );
}

/** Contenedor estándar para las páginas de la tienda. */
export function PageContainer({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return <div className={`container mx-auto px-4 py-8 ${narrow ? 'max-w-3xl' : ''}`}>{children}</div>;
}
