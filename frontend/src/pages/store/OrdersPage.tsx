import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight, Package } from 'lucide-react';
import type { Order, OrderStatus } from '../../lib/types';
import { formatDate, formatNumber, formatPrice, PAYMENT_METHOD } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ErrorState, StatusBadge } from '../../components/ui';
import { AccountShell, useOrders } from '../../components/store/AccountShell';
import { IN_PROGRESS, OrderProgress } from '../../components/store/OrderProgress';

const FILTERS: { id: string; label: string; match: (estado: OrderStatus) => boolean }[] = [
  { id: 'todos', label: 'Todos', match: () => true },
  { id: 'curso', label: 'En curso', match: (e) => IN_PROGRESS.includes(e) },
  { id: 'entregados', label: 'Entregados', match: (e) => e === 'entregado' },
  { id: 'cancelados', label: 'Cancelados', match: (e) => e === 'cancelado' },
];

/** Tarjeta de un pedido con fotos de sus productos y su avance. */
export function OrderCard({ order }: { order: Order }) {
  const images = order.imagenes ?? [];
  return (
    <Link
      to={`/mis-pedidos/${order.id}`}
      className="group flex flex-wrap items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-900/5 hover:ring-brand-200 sm:flex-nowrap sm:p-5"
    >
      <div className="flex shrink-0 -space-x-4">
        {images.length > 0 ? (
          images.map((img, i) => (
            <img
              key={i}
              src={productImage(img)}
              onError={onImageError}
              alt=""
              className="h-16 w-16 rounded-2xl bg-slate-50 object-contain p-1.5 ring-4 ring-white"
              style={{ zIndex: images.length - i }}
            />
          ))
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Package className="h-7 w-7" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-slate-900">Pedido #{order.id}</p>
          <StatusBadge status={order.estado} />
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {formatDate(order.fecha)}
          {order.productos !== undefined && ` · ${formatNumber(order.productos)} producto${order.productos === 1 ? '' : 's'}`}
          {order.metodoPago && ` · ${PAYMENT_METHOD[order.metodoPago]}`}
        </p>
        <div className="mt-3 max-w-xs">
          <OrderProgress estado={order.estado} compact />
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:w-auto sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <p className="text-xl font-extrabold text-slate-900">{formatPrice(order.total)}</p>
        <span className="flex items-center gap-1 text-sm font-bold text-brand-700 group-hover:text-brand-900">
          Ver detalle <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function OrdersPage() {
  const { data: orders, isPending, error, refetch } = useOrders();
  const [filter, setFilter] = useState('todos');
  useDocumentTitle('Mis pedidos');

  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const visible = (orders ?? []).filter((o) => active.match(o.estado));

  return (
    <AccountShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="section-title">Mis pedidos</h2>
        {orders && orders.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar pedidos">
            {FILTERS.map((f) => {
              const count = orders.filter((o) => f.match(o.estado)).length;
              const selected = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilter(f.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected ? 'bg-brand-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {f.label}
                  <span className={`rounded-full px-1.5 text-xs ${selected ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-28 rounded-3xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : orders.length === 0 ? (
        <div className="rounded-[2rem] bg-slate-50 px-6 py-16 text-center ring-1 ring-slate-200/70">
          <span className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Package className="h-9 w-9" />
          </span>
          <p className="font-display text-2xl font-semibold text-slate-900">Aún no tienes pedidos</p>
          <p className="mt-1 text-slate-600">Cuando compres, podrás seguir cada pedido desde aquí.</p>
          <Link to="/catalogo" className="btn-brand mt-6 px-8">
            Explorar el catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-3xl bg-slate-50 p-8 text-center text-slate-600 ring-1 ring-slate-200/70">No tienes pedidos en “{active.label}”.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </AccountShell>
  );
}
