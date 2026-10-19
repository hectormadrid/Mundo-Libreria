import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Barcode,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  Tags,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLogout, useSession } from '../../hooks/useSession';
import { api } from '../../lib/api';
import type { AdminCounts } from '../../lib/types';
import { LOGO_URL } from '../../lib/assets';
import { toastError } from '../../lib/alerts';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Contador de pendientes que se muestra junto al enlace. */
  badge?: (counts: AdminCounts) => { value: number; title: string } | null;
}

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: 'General',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Ventas',
    items: [
      {
        to: '/admin/pedidos',
        label: 'Pedidos',
        icon: ShoppingBag,
        badge: (c) => {
          const value = c.pedidosPendientes + c.porEnviar;
          return value ? { value, title: `${c.pedidosPendientes} pago(s) por confirmar, ${c.porEnviar} por enviar` } : null;
        },
      },
      { to: '/admin/usuarios', label: 'Clientes', icon: Users },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      {
        to: '/admin/productos',
        label: 'Productos',
        icon: Package,
        badge: (c) => (c.stockBajo ? { value: c.stockBajo, title: `${c.stockBajo} producto(s) con stock bajo` } : null),
      },
      { to: '/admin/categorias', label: 'Categorías', icon: Tags },
      { to: '/admin/familias', label: 'Familias', icon: FolderTree },
      { to: '/admin/codigos', label: 'Códigos de barras', icon: Barcode },
    ],
  },
  {
    title: 'Ajustes',
    items: [
      { to: '/admin/configuracion', label: 'Tienda', icon: Settings },
      { to: '/admin/administradores', label: 'Administradores', icon: Shield },
    ],
  },
];

/** Contadores de pendientes para el menú; se actualizan cada minuto. */
export function useAdminCounts() {
  return useQuery({ queryKey: ['admin', 'counts'], queryFn: () => api<AdminCounts>('/admin/counts'), refetchInterval: 60_000 });
}

export function AdminLayout() {
  const { data: session } = useSession();
  const { data: counts } = useAdminCounts();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }), onError: toastError });

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 text-white lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menú">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold">Panel de administración</span>
        <span className="w-6" />
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white p-1.5">
              <img src={LOGO_URL} alt="" className="h-7 w-7" />
            </span>
            <div>
              <p className="leading-tight font-bold">Mundo Librería</p>
              <p className="text-xs text-slate-400">Panel de administración</p>
            </div>
          </div>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Secciones del panel">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, end, badge }) => {
                  const b = counts && badge ? badge(counts) : null;
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-lib-blue font-semibold text-white shadow' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
                        }
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        <span className="flex-1">{label}</span>
                        {b && (
                          <span className="min-w-6 rounded-full bg-amber-400 px-1.5 text-center text-xs leading-5 font-bold text-slate-900" title={b.title}>
                            {b.value}
                            <span className="sr-only"> — {b.title}</span>
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-white/10 p-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
            <Store className="h-4 w-4" /> Ver tienda
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lib-yellow font-bold text-slate-900">
              {session?.admin?.nombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{session?.admin?.nombre}</p>
              <p className="text-xs text-slate-400">Administrador</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
