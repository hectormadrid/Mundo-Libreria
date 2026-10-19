import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { Barcode, FolderTree, LayoutDashboard, LogOut, Menu, Shield, ShoppingBag, Store, Tags, Users, X } from 'lucide-react';
import { useLogout, useSession } from '../../hooks/useSession';
import { LOGO_URL } from '../../lib/assets';
import { toastError } from '../../lib/alerts';

const LINKS = [
  { to: '/admin', label: 'Productos', icon: LayoutDashboard, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/familias', label: 'Familias', icon: FolderTree },
  { to: '/admin/codigos', label: 'Códigos de barras', icon: Barcode },
  { to: '/admin/administradores', label: 'Administradores', icon: Shield },
];

export function AdminLayout() {
  const { data: session } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () =>
    logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }), onError: toastError });

  return (
    <div className="min-h-screen bg-gray-100 lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-gray-900 px-4 py-3 text-white lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold">Panel de administración</span>
        <span className="w-6" />
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white p-1.5">
              <img src={LOGO_URL} alt="" className="h-7 w-7" />
            </span>
            <div>
              <p className="font-bold leading-tight">Mundo Librería</p>
              <p className="text-xs text-gray-400">Administración</p>
            </div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${isActive ? 'bg-lib-blue text-white shadow' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="mt-4 flex items-center gap-3 rounded-lg border-t border-white/10 px-3 py-2.5 pt-4 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <Store className="h-5 w-5" /> Ver tienda
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-gray-400">Sesión iniciada como</p>
          <p className="mb-3 font-semibold">{session?.admin?.nombre}</p>
          <button type="button" onClick={handleLogout} disabled={logout.isPending} className="btn-danger w-full py-2 text-sm">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
