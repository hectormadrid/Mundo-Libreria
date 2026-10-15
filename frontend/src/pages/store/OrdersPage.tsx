import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Package } from 'lucide-react';
import { api } from '../../lib/api';
import type { Order } from '../../lib/types';
import { formatDate, formatPrice, PAYMENT_METHOD } from '../../lib/format';
import { EmptyState, ErrorState, PageLoader, StatusBadge } from '../../components/ui';

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: () => api<Order[]>('/orders') });
}

export function OrderRow({ order }: { order: Order }) {
  return (
    <Link
      to={`/mis-pedidos/${order.id}`}
      className="card flex flex-wrap items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <p className="font-bold text-gray-800">Pedido #{order.id}</p>
        <p className="text-sm text-gray-500">
          {formatDate(order.fecha, true)}
          {order.metodoPago && ` · ${PAYMENT_METHOD[order.metodoPago] ?? order.metodoPago}`}
          {order.productos !== undefined && ` · ${order.productos} producto${order.productos === 1 ? '' : 's'}`}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <StatusBadge status={order.estado} />
        <span className="text-lg font-bold text-lib-blue">{formatPrice(order.total)}</span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Link>
  );
}

export function OrdersPage() {
  const { data: orders, isPending, error, refetch } = useOrders();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold text-gray-800">
        <Package className="h-8 w-8 text-lib-blue" /> Mis pedidos
      </h1>
      {isPending ? (
        <PageLoader />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState icon={<Package className="mx-auto h-16 w-16" />} title="Aún no tienes pedidos">
          <Link to="/" className="btn-primary mt-4 rounded-full px-8">
            Ir a la tienda
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
