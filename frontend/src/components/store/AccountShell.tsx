import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Package, UserRound } from 'lucide-react';
import { api } from '../../lib/api';
import type { Order } from '../../lib/types';
import { formatNumber, formatPrice } from '../../lib/format';
import { toastError } from '../../lib/alerts';
import { useLogout, useSession } from '../../hooks/useSession';
import { GlobeLines } from './GlobeLines';
import { IN_PROGRESS } from './OrderProgress';

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => api<Order[]>('/orders') });
}

/** Encabezado y navegación comunes de "Mi cuenta" (perfil y pedidos). */
export function AccountShell({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const orders = useOrders();
  const logout = useLogout();
  const navigate = useNavigate();
  const user = session?.user;
  const list = orders.data ?? [];
  const enCurso = list.filter((o) => IN_PROGRESS.includes(o.estado)).length;
  const comprado = list.filter((o) => o.estado !== 'cancelado').reduce((sum, o) => sum + o.total, 0);

  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap transition sm:px-5 ${
      isActive ? 'bg-white text-brand-950 shadow-lg' : 'text-white/75 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        <GlobeLines className="pointer-events-none absolute -top-32 -right-20 h-[28rem] w-[28rem] text-white/[0.07]" />
        <div className="shell relative pt-10 pb-6">
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sun-400 font-display text-3xl font-semibold text-brand-950 shadow-xl sm:h-20 sm:w-20">
              {user?.nombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/60">Mi cuenta</p>
              <h1 className="truncate font-display text-3xl font-semibold sm:text-4xl">Hola, {user?.nombre.split(' ')[0]}</h1>
              <p className="truncate text-sm text-white/70">{user?.correo}</p>
            </div>
            <dl className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:gap-3">
              <Stat label="Pedidos" value={orders.isSuccess ? formatNumber(list.length) : '–'} />
              <Stat label="En curso" value={orders.isSuccess ? formatNumber(enCurso) : '–'} />
              <Stat label="Comprado" value={orders.isSuccess ? formatPrice(comprado) : '–'} />
            </dl>
          </div>

          <nav className="no-scrollbar mt-8 flex items-center gap-2 overflow-x-auto" aria-label="Mi cuenta">
            <NavLink to="/mis-pedidos" className={tab}>
              <Package className="h-4 w-4" /> Mis pedidos
            </NavLink>
            <NavLink to="/perfil" className={tab}>
              <UserRound className="h-4 w-4" /> Mi perfil
            </NavLink>
            <button
              type="button"
              onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/'), onError: toastError })}
              disabled={logout.isPending}
              className="ml-auto flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </nav>
        </div>
      </section>
      <div className="shell py-8 lg:py-10">{children}</div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15 backdrop-blur sm:min-w-28 sm:px-4">
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className="truncate text-base font-extrabold sm:text-xl">{value}</dd>
    </div>
  );
}
