import { useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, Mail, MapPin, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminOrder, AdminOrderDetail, OrderHistoryEntry, OrderStatus } from '../../lib/types';
import { formatDate, formatNumber, formatPrice, ORDER_STATUS, PAYMENT_METHOD } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { csvDate, downloadCsv } from '../../lib/csv';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ErrorState, Modal, PageLoader, Spinner, StatusBadge } from '../../components/ui';

const STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[];
/** Siguiente paso habitual de cada estado, para sugerirlo en el formulario. */
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { pendiente: 'pagado', pagado: 'enviado', enviado: 'entregado' };

const RANGOS = [
  { value: '', label: 'Todas las fechas' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
];

function Timeline({ entries }: { entries: OrderHistoryEntry[] }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-gray-200 pl-5">
      {entries.map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute top-1 -left-[27px] h-3 w-3 rounded-full border-2 border-white bg-lib-blue ring-2 ring-gray-200" aria-hidden="true" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={h.estado} />
            <span className="text-xs text-gray-500">{formatDate(h.fecha, true)}</span>
            <span className="text-xs text-gray-500">· {h.administrador ?? 'Sistema'}</span>
          </div>
          {h.nota && <p className="mt-1 text-sm whitespace-pre-line text-gray-700">{h.nota}</p>}
        </li>
      ))}
    </ol>
  );
}

function StatusForm({ order }: { order: AdminOrderDetail }) {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<OrderStatus>(NEXT[order.estado] ?? order.estado);
  const [nota, setNota] = useState('');
  const [notificar, setNotificar] = useState(true);

  const update = useMutation({
    mutationFn: () => api<{ estado: OrderStatus; historial: OrderHistoryEntry[] }>(`/admin/orders/${order.id}/status`, { method: 'PATCH', body: { estado, nota, notificar } }),
    onSuccess: (res) => {
      queryClient.setQueryData<AdminOrderDetail>(['admin', 'orders', order.id], (o) => (o ? { ...o, estado: res.estado, historial: res.historial } : o));
      queryClient.setQueryData<AdminOrder[]>(['admin', 'orders'], (list) => list?.map((o) => (o.id === order.id ? { ...o, estado: res.estado } : o)));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'counts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toastSuccess(estado === order.estado ? 'Nota agregada al historial' : `Pedido #${order.id}: ${ORDER_STATUS[res.estado].label.toLowerCase()}`);
      setNota('');
    },
    onError: toastError,
  });

  if (order.estado === 'cancelado') {
    return <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Este pedido está cancelado: su stock ya volvió al inventario y no se puede reactivar.</p>;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (estado === order.estado && !nota.trim()) return toastError('Elige un estado distinto o escribe una nota.');
    if (estado === 'cancelado') {
      const ok = await confirmAction(`¿Cancelar el pedido #${order.id}?`, 'El stock de sus productos volverá al inventario y el pedido no se podrá reactivar.', 'Sí, cancelar pedido');
      if (!ok) return;
    }
    update.mutate();
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-3 rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900">Actualizar pedido</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="o-estado" className="label">
            Nuevo estado
          </label>
          <select id="o-estado" className="input" value={estado} onChange={(e) => setEstado(e.target.value as OrderStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS[s].label}
                {s === order.estado ? ' (actual)' : ''}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-gray-700">
          <input type="checkbox" className="h-4 w-4 accent-lib-blue" checked={notificar} onChange={(e) => setNotificar(e.target.checked)} />
          Avisar al cliente por correo
        </label>
      </div>
      <div>
        <label htmlFor="o-nota" className="label">
          Nota <span className="font-normal text-gray-500">(opcional{notificar ? ', se incluye en el correo' : ''})</span>
        </label>
        <textarea id="o-nota" rows={2} maxLength={500} className="input" placeholder="Ej.: Despachado por Starken, seguimiento 123456" value={nota} onChange={(e) => setNota(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary" disabled={update.isPending}>
        {update.isPending && <Spinner className="h-4 w-4" />} Guardar
      </button>
    </form>
  );
}

function OrderDetailModal({ orderId, onClose }: { orderId: number | null; onClose: () => void }) {
  const { data: order, isPending, error } = useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => api<AdminOrderDetail>(`/admin/orders/${orderId}`),
    enabled: orderId !== null,
  });

  return (
    <Modal open={orderId !== null} onClose={onClose} title={`Pedido #${orderId ?? ''}`} size="xl">
      {isPending ? (
        <PageLoader />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={order.estado} />
              <span className="text-sm text-gray-500">{formatDate(order.fecha, true)}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold">{order.metodoPago ? PAYMENT_METHOD[order.metodoPago] : 'N/A'}</span>
            </div>

            <dl className="grid gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-gray-500 uppercase">Contacto del pedido</dt>
                <dd className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" /> {order.nombreContacto}
                </dd>
                <dd className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${order.correoContacto}`} className="text-lib-blue hover:underline">
                    {order.correoContacto}
                  </a>
                </dd>
                <dd className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" /> {order.telefonoContacto || 'Sin teléfono'}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold text-gray-500 uppercase">Envío</dt>
                <dd className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /> {order.direccionEnvio || 'Sin dirección (retiro en tienda)'}
                </dd>
                <dd className="pt-2 text-xs text-gray-500">
                  Cuenta:{' '}
                  <Link to={`/admin/usuarios?ver=${order.idCliente}`} className="text-lib-blue hover:underline">
                    {order.cliente} · {order.rut}
                  </Link>
                </dd>
              </div>
            </dl>

            <table className="min-w-full text-sm">
              <thead className="border-b text-left text-gray-600">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2 text-center">Cant.</th>
                  <th className="py-2 text-right">Precio</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y tabular-nums">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.nombre}</td>
                    <td className="py-2 text-center">{item.cantidad}</td>
                    <td className="py-2 text-right">{formatPrice(item.precio)}</td>
                    <td className="py-2 text-right font-semibold">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-3 text-right font-semibold">
                    Total
                  </td>
                  <td className="pt-3 text-right text-lg font-bold">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>

            <StatusForm key={`${order.id}-${order.estado}-${order.historial.length}`} order={order} />
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-3 font-semibold text-gray-900">Historial</h3>
            <Timeline entries={order.historial} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export function OrdersAdminPage() {
  const [params, setParams] = useSearchParams();
  const estadoFilter = (params.get('estado') ?? '') as OrderStatus | '';
  const rango = params.get('dias') ?? '';
  const verParam = Number(params.get('ver'));
  const viewing = Number.isInteger(verParam) && verParam > 0 ? verParam : null;
  const [visibleKeys, setVisibleKeys] = useState<(string | number)[]>([]);

  const orders = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => api<AdminOrder[]>('/admin/orders') });
  const all = useMemo(() => orders.data ?? [], [orders.data]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key !== 'ver' });
  };

  const inRange = useMemo(() => {
    if (!rango) return all;
    const desde = Date.now() - Number(rango) * 24 * 60 * 60 * 1000;
    return all.filter((o) => new Date(o.fecha).getTime() >= desde);
  }, [all, rango]);

  const countByStatus = useMemo(() => {
    const counts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
    inRange.forEach((o) => counts[o.estado]++);
    return counts;
  }, [inRange]);

  const rows = estadoFilter ? inRange.filter((o) => o.estado === estadoFilter) : inRange;
  const totalRows = rows.reduce((sum, o) => sum + (o.estado === 'cancelado' ? 0 : o.total), 0);

  const byKey = useMemo(() => new Map(all.map((o) => [o.id, o])), [all]);
  const visibleRows = visibleKeys.map((k) => byKey.get(Number(k))).filter((o): o is AdminOrder => Boolean(o));

  const exportCsv = () =>
    downloadCsv('pedidos', visibleRows, [
      { header: 'Pedido', value: (o) => o.id },
      { header: 'Fecha', value: (o) => csvDate(o.fecha) },
      { header: 'Cliente', value: (o) => o.cliente },
      { header: 'Correo', value: (o) => o.correo },
      { header: 'Productos', value: (o) => o.productos ?? '' },
      { header: 'Total', value: (o) => o.total },
      { header: 'Pago', value: (o) => (o.metodoPago ? PAYMENT_METHOD[o.metodoPago] : '') },
      { header: 'Estado', value: (o) => ORDER_STATUS[o.estado].label },
      { header: 'Teléfono', value: (o) => o.telefonoContacto ?? '' },
      { header: 'Dirección de envío', value: (o) => o.direccionEnvio ?? '' },
    ]);

  const columns: Column<AdminOrder>[] = [
    {
      header: 'Pedido',
      cell: (o) => (
        <button type="button" onClick={() => setParam('ver', String(o.id))} className="font-semibold text-lib-blue hover:underline">
          #{o.id}
        </button>
      ),
      sortValue: (o) => o.id,
    },
    {
      header: 'Cliente',
      cell: (o) => (
        <>
          <p className="font-semibold text-gray-900">{o.cliente}</p>
          <p className="text-xs text-gray-500">{o.correo}</p>
        </>
      ),
      sortValue: (o) => o.cliente,
    },
    { header: 'Fecha', cell: (o) => formatDate(o.fecha, true), sortValue: (o) => o.fecha, className: 'whitespace-nowrap text-gray-600' },
    { header: 'Productos', cell: (o) => formatNumber(o.productos ?? 0), sortValue: (o) => o.productos ?? 0 },
    { header: 'Pago', cell: (o) => (o.metodoPago ? PAYMENT_METHOD[o.metodoPago] : 'N/A'), sortValue: (o) => o.metodoPago },
    { header: 'Estado', cell: (o) => <StatusBadge status={o.estado} />, sortValue: (o) => STATUSES.indexOf(o.estado) },
    { header: 'Total', cell: (o) => <span className="font-semibold tabular-nums">{formatPrice(o.total)}</span>, sortValue: (o) => o.total, className: 'text-right whitespace-nowrap' },
    {
      header: 'Acciones',
      cell: (o) => (
        <button type="button" onClick={() => setParam('ver', String(o.id))} className="btn-ghost px-3 py-1.5 text-sm" aria-label={`Gestionar pedido ${o.id}`}>
          <Eye className="h-4 w-4" /> Gestionar
        </button>
      ),
    },
  ];

  if (orders.isPending) return <PageLoader />;
  if (orders.error) return <ErrorState error={orders.error} onRetry={() => void orders.refetch()} />;

  const tabs: { value: OrderStatus | ''; label: string; count: number }[] = [
    { value: '', label: 'Todos', count: inRange.length },
    ...STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label, count: countByStatus[s] })),
  ];

  return (
    <>
      <AdminPageHeader title="Pedidos" subtitle="Confirma pagos, despacha y haz seguimiento de cada compra">
        <select className="input w-auto" value={rango} onChange={(e) => setParam('dias', e.target.value)} aria-label="Rango de fechas">
          {RANGOS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-ghost" onClick={exportCsv} disabled={!visibleRows.length}>
          <Download className="h-4 w-4" /> Exportar
        </button>
      </AdminPageHeader>

      <div className="mb-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-gray-200" role="tablist" aria-label="Estado del pedido">
        {tabs.map((t) => {
          const active = estadoFilter === t.value;
          return (
            <button
              key={t.value || 'todos'}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParam('estado', t.value || null)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${active ? 'border-lib-blue text-lib-blue' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              {t.label}
              <span className={`rounded-full px-2 text-xs leading-5 ${active ? 'bg-lib-blue text-white' : 'bg-gray-100 text-gray-600'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-sm text-gray-600">
        {rows.length} pedido(s){estadoFilter !== 'cancelado' && rows.length > 0 && <> · {formatPrice(totalRows)} en total{estadoFilter ? '' : ' (sin cancelados)'}</>}
      </p>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(o) => o.id}
        searchText={(o) => `${o.id} ${o.cliente} ${o.correo} ${o.metodoPago ?? ''} ${o.direccionEnvio ?? ''}`}
        searchPlaceholder="Buscar por número, cliente o correo..."
        emptyMessage="No hay pedidos con estos filtros."
        onFilteredChange={setVisibleKeys}
      />
      <OrderDetailModal orderId={viewing} onClose={() => setParam('ver', null)} />
    </>
  );
}
