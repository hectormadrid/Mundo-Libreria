import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, BookOpen, Clock, DollarSign, Pencil, Plus, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminProduct, Metrics } from '../../lib/types';
import { formatDate, formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { toastError, toastSuccess } from '../../lib/alerts';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { ErrorState, PageLoader } from '../../components/ui';

function MetricCard({ label, value, icon: Icon, color, alert }: { label: string; value: string; icon: typeof BookOpen; color: string; alert?: boolean }) {
  return (
    <div className="card relative flex items-center justify-between p-5">
      {alert && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <span className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const metrics = useQuery({ queryKey: ['admin', 'metrics'], queryFn: () => api<Metrics>('/admin/metrics') });
  const products = useQuery({ queryKey: ['admin', 'products'], queryFn: () => api<AdminProduct[]>('/admin/products') });

  const toggleStatus = useMutation({
    mutationFn: (p: AdminProduct) =>
      api<AdminProduct>(`/admin/products/${p.id}/status`, { method: 'PATCH', body: { estado: p.estado === 'activo' ? 'inactivo' : 'activo' } }),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminProduct[]>(['admin', 'products'], (list) => list?.map((p) => (p.id === updated.id ? updated : p)));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toastSuccess(`Producto ${updated.estado === 'activo' ? 'activado' : 'desactivado'}`);
    },
    onError: toastError,
  });

  const openModal = (product: AdminProduct | null) => {
    setEditing(product);
    setModalOpen(true);
  };
  const closeModal = useCallback(() => setModalOpen(false), []);

  const columns: Column<AdminProduct>[] = [
    { header: 'ID', cell: (p) => p.id, sortValue: (p) => p.id },
    {
      header: 'Producto',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img src={productImage(p.imagen)} onError={onImageError} alt="" className="h-12 w-12 shrink-0 rounded-lg border bg-white object-contain p-0.5" />
          <div className="min-w-0">
            <p className="max-w-[16rem] truncate font-semibold text-gray-800" title={p.nombre}>
              {p.nombre}
            </p>
            <p className="font-mono text-xs text-gray-500">{p.codigoBarras ?? 'Sin código'}</p>
          </div>
        </div>
      ),
      sortValue: (p) => p.nombre,
    },
    { header: 'Precio', cell: (p) => formatPrice(p.precio), sortValue: (p) => p.precio, className: 'whitespace-nowrap' },
    {
      header: 'Categoría',
      cell: (p) => (
        <>
          <p>{p.categoria ?? <span className="text-gray-400">Sin categoría</span>}</p>
          {p.familia && <p className="text-xs text-gray-500">{p.familia}</p>}
        </>
      ),
      sortValue: (p) => p.categoria,
    },
    {
      header: 'Stock',
      cell: (p) => <span className={p.stock < 10 ? 'font-bold text-orange-600' : ''}>{p.stock}</span>,
      sortValue: (p) => p.stock,
    },
    {
      header: 'Estado',
      cell: (p) => (
        <button
          type="button"
          role="switch"
          aria-checked={p.estado === 'activo'}
          aria-label={`${p.estado === 'activo' ? 'Desactivar' : 'Activar'} ${p.nombre}`}
          onClick={() => toggleStatus.mutate(p)}
          disabled={toggleStatus.isPending}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${p.estado === 'activo' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
        </button>
      ),
      sortValue: (p) => p.estado,
    },
    { header: 'Creado', cell: (p) => formatDate(p.fechaCreacion), sortValue: (p) => p.fechaCreacion, className: 'whitespace-nowrap' },
    {
      header: 'Acciones',
      cell: (p) => (
        <button type="button" onClick={() => openModal(p)} className="btn-ghost px-3 py-1.5 text-sm" aria-label={`Editar ${p.nombre}`}>
          <Pencil className="h-4 w-4" /> Editar
        </button>
      ),
    },
  ];

  const m = metrics.data;

  return (
    <>
      <AdminPageHeader title="Productos">
        <button type="button" className="btn-primary" onClick={() => openModal(null)}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </AdminPageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total catálogo" value={m ? String(m.totalProductos) : '—'} icon={BookOpen} color="bg-blue-100 text-lib-blue" />
        <MetricCard label="Ventas del mes" value={m ? formatPrice(m.ventasMes) : '—'} icon={DollarSign} color="bg-green-100 text-green-700" />
        <MetricCard
          label="Pedidos pendientes"
          value={m ? String(m.pedidosPendientes) : '—'}
          icon={Clock}
          color="bg-yellow-100 text-yellow-700"
          alert={Boolean(m && m.pedidosPendientes > 0)}
        />
        <MetricCard label="Stock bajo (< 10)" value={m ? String(m.stockBajo) : '—'} icon={AlertTriangle} color="bg-red-100 text-lib-red" />
      </div>

      {products.isPending ? (
        <PageLoader />
      ) : products.error ? (
        <ErrorState error={products.error} onRetry={() => void products.refetch()} />
      ) : (
        <DataTable
          rows={products.data}
          columns={columns}
          rowKey={(p) => p.id}
          searchText={(p) => `${p.id} ${p.nombre} ${p.codigoBarras ?? ''} ${p.categoria ?? ''} ${p.familia ?? ''} ${p.marca ?? ''}`}
          searchPlaceholder="Buscar por nombre, código, categoría..."
          emptyMessage="Aún no hay productos."
          toolbar={
            <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={() => void queryClient.invalidateQueries({ queryKey: ['admin'] })}>
              <RefreshCw className="h-4 w-4" /> Refrescar
            </button>
          }
        />
      )}

      <ProductFormModal product={editing} open={modalOpen} onClose={closeModal} />
    </>
  );
}
