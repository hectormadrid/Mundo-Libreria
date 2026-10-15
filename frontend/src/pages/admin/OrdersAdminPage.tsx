import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminOrder, AdminOrderDetail, OrderStatus } from '../../lib/types';
import { formatDate, formatPrice, ORDER_STATUS, PAYMENT_METHOD } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ErrorState, Modal, PageLoader, StatusBadge } from '../../components/ui';

const STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[];

function OrderDetailModal({ orderId, onClose }: { orderId: number | null; onClose: () => void }) {
  const { data: order, isPending, error } = useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => api<AdminOrderDetail>(`/admin/orders/${orderId}`),
    enabled: orderId !== null,
  });

  return (
    <Modal open={orderId !== null} onClose={onClose} title={`Pedido #${orderId ?? ''}`} size="lg">
      {isPending ? (
        <PageLoader />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="space-y-5">
          <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Cliente</dt>
              <dd className="font-semibold">{order.cliente}</dd>
              <dd className="text-gray-600">{order.correo}</dd>
              <dd className="text-gray-600">RUT: {order.rut}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Envío</dt>
              <dd className="font-semibold">{order.direccionEnvio || 'Sin dirección'}</dd>
              <dd className="text-gray-600">{order.telefonoContacto || 'Sin teléfono'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Fecha</dt>
              <dd className="font-semibold">{formatDate(order.fecha, true)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Pago</dt>
              <dd className="flex items-center gap-2 font-semibold">
                {order.metodoPago ? PAYMENT_METHOD[order.metodoPago] ?? order.metodoPago : 'N/A'} <StatusBadge status={order.estado} />
              </dd>
            </div>
          </dl>
          <table className="min-w-full text-sm">
            <thead className="border-b text-left text-gray-600">
              <tr>
                <th className="py-2">Producto</th>
                <th className="py-2 text-center">Cantidad</th>
                <th className="py-2 text-right">Precio</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">{item.nombre}</td>
                  <td className="py-2 text-center">{item.cantidad}</td>
                  <td className="py-2 text-right">{formatPrice(item.precio)}</td>
                  <td className="py-2 text-right font-semibold">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-xl font-bold">
            Total: <span className="text-green-700">{formatPrice(order.total)}</span>
          </p>
        </div>
      )}
    </Modal>
  );
}

export function OrdersAdminPage() {
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<number | null>(null);
  const orders = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => api<AdminOrder[]>('/admin/orders') });

  const updateStatus = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: OrderStatus }) =>
      api<{ id: number; estado: OrderStatus }>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { estado } }),
    onSuccess: ({ id, estado }) => {
      queryClient.setQueryData<AdminOrder[]>(['admin', 'orders'], (list) => list?.map((o) => (o.id === id ? { ...o, estado } : o)));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toastSuccess(`Pedido #${id}: ${ORDER_STATUS[estado].label.toLowerCase()}`);
    },
    onError: toastError,
  });

  const changeStatus = async (order: AdminOrder, estado: OrderStatus) => {
    if (estado === 'cancelado') {
      const ok = await confirmAction(
        `¿Cancelar el pedido #${order.id}?`,
        'El stock de sus productos volverá al inventario y el pedido no se podrá reactivar.',
        'Sí, cancelar pedido',
      );
      if (!ok) return;
    }
    updateStatus.mutate({ id: order.id, estado });
  };

  const columns: Column<AdminOrder>[] = [
    { header: 'Pedido', cell: (o) => <span className="font-semibold">#{o.id}</span>, sortValue: (o) => o.id },
    {
      header: 'Cliente',
      cell: (o) => (
        <>
          <p className="font-semibold">{o.cliente}</p>
          <p className="text-xs text-gray-500">{o.correo}</p>
        </>
      ),
      sortValue: (o) => o.cliente,
    },
    { header: 'Total', cell: (o) => formatPrice(o.total), sortValue: (o) => o.total, className: 'whitespace-nowrap' },
    {
      header: 'Pago',
      cell: (o) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold">{o.metodoPago ? PAYMENT_METHOD[o.metodoPago] ?? o.metodoPago : 'N/A'}</span>
      ),
      sortValue: (o) => o.metodoPago,
    },
    {
      header: 'Estado',
      cell: (o) =>
        o.estado === 'cancelado' ? (
          <StatusBadge status="cancelado" />
        ) : (
          <select
            className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold ${ORDER_STATUS[o.estado].className}`}
            value={o.estado}
            disabled={updateStatus.isPending}
            onChange={(e) => void changeStatus(o, e.target.value as OrderStatus)}
            aria-label={`Estado del pedido ${o.id}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS[s].label}
              </option>
            ))}
          </select>
        ),
      sortValue: (o) => o.estado,
    },
    { header: 'Fecha', cell: (o) => formatDate(o.fecha, true), sortValue: (o) => o.fecha, className: 'whitespace-nowrap' },
    {
      header: 'Detalle',
      cell: (o) => (
        <button type="button" onClick={() => setViewing(o.id)} className="btn-ghost px-3 py-1.5 text-sm" aria-label={`Ver pedido ${o.id}`}>
          <Eye className="h-4 w-4" /> Ver
        </button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Pedidos" />
      {orders.isPending ? (
        <PageLoader />
      ) : orders.error ? (
        <ErrorState error={orders.error} onRetry={() => void orders.refetch()} />
      ) : (
        <DataTable
          rows={orders.data}
          columns={columns}
          rowKey={(o) => o.id}
          searchText={(o) => `${o.id} ${o.cliente} ${o.correo} ${o.estado} ${o.metodoPago ?? ''}`}
          searchPlaceholder="Buscar por número, cliente, estado..."
          emptyMessage="Aún no hay pedidos."
        />
      )}
      <OrderDetailModal orderId={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
