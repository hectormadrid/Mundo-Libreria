import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PackageX } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { OrderDetail } from '../../lib/types';
import { formatDate, formatPrice, PAYMENT_METHOD } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { EmptyState, ErrorState, PageLoader, StatusBadge } from '../../components/ui';

export function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isPending, error, refetch } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => api<OrderDetail>(`/orders/${id}`),
  });

  if (isPending) return <PageLoader />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState icon={<PackageX className="mx-auto h-16 w-16" />} title="Pedido no encontrado">
        <Link to="/mis-pedidos" className="btn-primary mt-4">
          Ver mis pedidos
        </Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link to="/mis-pedidos" className="mb-6 inline-flex items-center gap-2 text-lib-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Mis pedidos
      </Link>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-lib-red to-lib-blue p-6 text-white">
          <div>
            <h1 className="text-2xl font-bold">Pedido #{order.id}</h1>
            <p className="opacity-90">{formatDate(order.fecha, true)}</p>
          </div>
          <StatusBadge status={order.estado} />
        </div>

        <dl className="grid gap-4 border-b border-gray-100 p-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Método de pago</dt>
            <dd className="font-semibold">{order.metodoPago ? PAYMENT_METHOD[order.metodoPago] ?? order.metodoPago : 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Dirección de envío</dt>
            <dd className="font-semibold">{order.direccionEnvio || 'No indicada'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Teléfono de contacto</dt>
            <dd className="font-semibold">{order.telefonoContacto || 'No indicado'}</dd>
          </div>
        </dl>

        <ul className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-6">
              <img src={productImage(item.imagen)} onError={onImageError} alt="" className="h-16 w-16 rounded-lg border object-contain p-1" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.nombre}</p>
                <p className="text-sm text-gray-500">
                  {item.cantidad} × {formatPrice(item.precio)}
                </p>
              </div>
              <span className="font-bold">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between bg-gray-50 p-6 text-xl font-bold">
          <span>Total</span>
          <span className="text-lib-blue">{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.seguimiento.length > 0 && (
        <section className="card mt-6 p-6" aria-labelledby="seguimiento-titulo">
          <h2 id="seguimiento-titulo" className="mb-4 text-lg font-bold text-gray-800">
            Seguimiento
          </h2>
          <ol className="relative space-y-4 border-l-2 border-gray-200 pl-5">
            {order.seguimiento.map((s, i) => (
              <li key={i} className="relative flex flex-wrap items-center gap-3">
                <span className="absolute -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-lib-blue ring-2 ring-gray-200" aria-hidden="true" />
                <StatusBadge status={s.estado} />
                <span className="text-sm text-gray-500">{formatDate(s.fecha, true)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
