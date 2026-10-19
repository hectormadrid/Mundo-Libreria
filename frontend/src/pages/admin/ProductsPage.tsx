import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Barcode, Download, Eye, EyeOff, PackageX, Pencil, Plus, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminProduct } from '../../lib/types';
import { formatDate, formatNumber, formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { csvDate, downloadCsv } from '../../lib/csv';
import { useCategories } from '../../components/store/CategoryNav';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { ErrorState, PageLoader, Spinner } from '../../components/ui';

type StockFilter = '' | 'bajo' | 'agotado' | 'disponible';
type EstadoFilter = '' | 'activo' | 'inactivo';

const LOW_STOCK = 10;

/** Stock editable directamente en la tabla: clic, escribir y Enter. */
function StockCell({ product }: { product: AdminProduct }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(product.stock));

  const save = useMutation({
    mutationFn: (stock: number) => api<AdminProduct>(`/admin/products/${product.id}/stock`, { method: 'PATCH', body: { stock } }),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminProduct[]>(['admin', 'products'], (list) => list?.map((p) => (p.id === updated.id ? updated : p)));
      void queryClient.invalidateQueries({ queryKey: ['admin', 'counts'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toastSuccess(`Stock de "${updated.nombre}": ${updated.stock}`);
      setEditing(false);
    },
    onError: toastError,
  });

  const commit = () => {
    const stock = Number(value);
    if (value.trim() === '' || !Number.isInteger(stock) || stock < 0) {
      toastError('El stock debe ser un número entero mayor o igual a 0.');
      return;
    }
    if (stock === product.stock) return setEditing(false);
    save.mutate(stock);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setValue(String(product.stock));
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          autoFocus
          className="w-20 rounded-md border border-lib-blue px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-lib-blue/30"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          onBlur={commit}
          disabled={save.isPending}
          aria-label={`Nuevo stock de ${product.nombre}`}
        />
        {save.isPending && <Spinner className="h-4 w-4 text-lib-blue" />}
      </div>
    );
  }

  const tone = product.stock === 0 ? 'bg-red-100 text-red-800' : product.stock < LOW_STOCK ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
  return (
    <button
      type="button"
      onClick={() => {
        setValue(String(product.stock));
        setEditing(true);
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition hover:ring-2 hover:ring-lib-blue/30 ${tone}`}
      title="Clic para editar el stock"
      aria-label={`Stock de ${product.nombre}: ${product.stock}. Editar`}
    >
      {product.stock === 0 ? <PackageX className="h-3.5 w-3.5" /> : product.stock < LOW_STOCK ? <AlertTriangle className="h-3.5 w-3.5" /> : null}
      {product.stock === 0 ? 'Agotado' : formatNumber(product.stock)}
    </button>
  );
}

function SummaryChip({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-4 py-2.5 text-left transition ${active ? 'border-lib-blue bg-blue-50 ring-2 ring-lib-blue/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{formatNumber(value)}</p>
    </button>
  );
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const { data: categories = [] } = useCategories();
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [visibleKeys, setVisibleKeys] = useState<(string | number)[]>([]);

  const stockFilter = (params.get('stock') ?? '') as StockFilter;
  const estadoFilter = (params.get('estado') ?? '') as EstadoFilter;
  const categoriaFilter = params.get('categoria') ?? '';

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setSelected(new Set());
  };

  const products = useQuery({ queryKey: ['admin', 'products'], queryFn: () => api<AdminProduct[]>('/admin/products') });
  const all = useMemo(() => products.data ?? [], [products.data]);

  const resumen = useMemo(
    () => ({
      total: all.length,
      activos: all.filter((p) => p.estado === 'activo').length,
      inactivos: all.filter((p) => p.estado === 'inactivo').length,
      bajo: all.filter((p) => p.estado === 'activo' && p.stock > 0 && p.stock < LOW_STOCK).length,
      agotados: all.filter((p) => p.estado === 'activo' && p.stock === 0).length,
    }),
    [all],
  );

  const rows = useMemo(
    () =>
      all.filter((p) => {
        if (estadoFilter && p.estado !== estadoFilter) return false;
        if (categoriaFilter && String(p.idCategoria ?? '') !== categoriaFilter) return false;
        if (stockFilter === 'agotado' && !(p.estado === 'activo' && p.stock === 0)) return false;
        if (stockFilter === 'bajo' && !(p.estado === 'activo' && p.stock < LOW_STOCK)) return false;
        if (stockFilter === 'disponible' && p.stock === 0) return false;
        return true;
      }),
    [all, estadoFilter, categoriaFilter, stockFilter],
  );

  const refreshAfterChange = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const toggleStatus = useMutation({
    mutationFn: (p: AdminProduct) => api<AdminProduct>(`/admin/products/${p.id}/status`, { method: 'PATCH', body: { estado: p.estado === 'activo' ? 'inactivo' : 'activo' } }),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminProduct[]>(['admin', 'products'], (list) => list?.map((p) => (p.id === updated.id ? updated : p)));
      refreshAfterChange();
      toastSuccess(`"${updated.nombre}" ${updated.estado === 'activo' ? 'ahora se muestra en la tienda' : 'quedó oculto de la tienda'}`);
    },
    onError: toastError,
  });

  const bulkStatus = useMutation({
    mutationFn: (estado: 'activo' | 'inactivo') => api<{ actualizados: number }>('/admin/products/status', { method: 'PATCH', body: { ids: [...selected], estado } }),
    onSuccess: ({ actualizados }, estado) => {
      refreshAfterChange();
      setSelected(new Set());
      toastSuccess(`${actualizados} producto(s) ${estado === 'activo' ? 'activados' : 'desactivados'}`);
    },
    onError: toastError,
  });

  const runBulk = async (estado: 'activo' | 'inactivo') => {
    const ok = await confirmAction(
      `${estado === 'activo' ? 'Activar' : 'Desactivar'} ${selected.size} producto(s)`,
      estado === 'activo' ? 'Volverán a mostrarse en la tienda.' : 'Dejarán de mostrarse en la tienda. Podrás reactivarlos cuando quieras.',
      estado === 'activo' ? 'Sí, activar' : 'Sí, desactivar',
    );
    if (ok) bulkStatus.mutate(estado);
  };

  const exportCsv = (list: AdminProduct[]) =>
    downloadCsv('productos', list, [
      { header: 'ID', value: (p) => p.id },
      { header: 'Nombre', value: (p) => p.nombre },
      { header: 'Código de barras', value: (p) => p.codigoBarras },
      { header: 'Categoría', value: (p) => p.categoria },
      { header: 'Familia', value: (p) => p.familia },
      { header: 'Marca', value: (p) => p.marca },
      { header: 'Color', value: (p) => p.color },
      { header: 'Precio', value: (p) => p.precio },
      { header: 'Stock', value: (p) => p.stock },
      { header: 'Unidades vendidas', value: (p) => p.vendidos },
      { header: 'Estado', value: (p) => p.estado },
      { header: 'Creado', value: (p) => csvDate(p.fechaCreacion) },
    ]);

  const byKey = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const visibleRows = visibleKeys.map((k) => byKey.get(Number(k))).filter((p): p is AdminProduct => Boolean(p));

  const openModal = (product: AdminProduct | null) => {
    setEditing(product);
    setModalOpen(true);
  };
  const closeModal = useCallback(() => setModalOpen(false), []);

  const columns: Column<AdminProduct>[] = [
    {
      header: 'Producto',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <img src={productImage(p.imagen)} onError={onImageError} alt="" className="h-12 w-12 shrink-0 rounded-lg border bg-white object-contain p-0.5" />
          <div className="min-w-0">
            <button type="button" onClick={() => openModal(p)} className="block max-w-[16rem] truncate text-left font-semibold text-gray-900 hover:text-lib-blue" title={p.nombre}>
              {p.nombre}
            </button>
            <p className="font-mono text-xs text-gray-500">
              #{p.id} · {p.codigoBarras ?? 'Sin código'}
            </p>
          </div>
        </div>
      ),
      sortValue: (p) => p.nombre,
    },
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
    { header: 'Precio', cell: (p) => <span className="tabular-nums">{formatPrice(p.precio)}</span>, sortValue: (p) => p.precio, className: 'whitespace-nowrap' },
    { header: 'Stock', cell: (p) => <StockCell product={p} />, sortValue: (p) => p.stock },
    { header: 'Vendidos', cell: (p) => <span className="tabular-nums">{formatNumber(p.vendidos)}</span>, sortValue: (p) => p.vendidos },
    {
      header: 'Estado',
      cell: (p) => (
        <button
          type="button"
          role="switch"
          aria-checked={p.estado === 'activo'}
          aria-label={`${p.estado === 'activo' ? 'Ocultar' : 'Mostrar'} ${p.nombre} en la tienda`}
          onClick={() => toggleStatus.mutate(p)}
          disabled={toggleStatus.isPending}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${p.estado === 'activo' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          {p.estado === 'activo' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {p.estado === 'activo' ? 'Visible' : 'Oculto'}
        </button>
      ),
      sortValue: (p) => p.estado,
    },
    { header: 'Creado', cell: (p) => formatDate(p.fechaCreacion), sortValue: (p) => p.fechaCreacion, className: 'whitespace-nowrap text-gray-600' },
    {
      header: 'Acciones',
      cell: (p) => (
        <div className="flex gap-1">
          <button type="button" onClick={() => openModal(p)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-lib-blue" title="Editar" aria-label={`Editar ${p.nombre}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <Link to={`/admin/codigos?producto=${p.id}`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-lib-blue" title="Imprimir etiqueta" aria-label={`Etiqueta de ${p.nombre}`}>
            <Barcode className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  if (products.isPending) return <PageLoader />;
  if (products.error) return <ErrorState error={products.error} onRetry={() => void products.refetch()} />;

  const hasFilters = Boolean(stockFilter || estadoFilter || categoriaFilter);

  return (
    <>
      <AdminPageHeader title="Productos" subtitle="Catálogo, stock y visibilidad en la tienda">
        <button type="button" className="btn-ghost" onClick={() => exportCsv(visibleRows)} disabled={!visibleRows.length}>
          <Download className="h-4 w-4" /> Exportar
        </button>
        <button type="button" className="btn-primary" onClick={() => openModal(null)}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </AdminPageHeader>

      <div className="mb-4 flex flex-wrap gap-3">
        <SummaryChip label="Todos" value={resumen.total} active={!hasFilters} onClick={() => setParams({}, { replace: true })} />
        <SummaryChip label="Visibles" value={resumen.activos} active={estadoFilter === 'activo' && !stockFilter} onClick={() => setParams({ estado: 'activo' }, { replace: true })} />
        <SummaryChip label="Ocultos" value={resumen.inactivos} active={estadoFilter === 'inactivo'} onClick={() => setParams({ estado: 'inactivo' }, { replace: true })} />
        <SummaryChip label="Stock bajo (< 10)" value={resumen.bajo + resumen.agotados} active={stockFilter === 'bajo'} onClick={() => setParams({ stock: 'bajo' }, { replace: true })} />
        <SummaryChip label="Agotados" value={resumen.agotados} active={stockFilter === 'agotado'} onClick={() => setParams({ stock: 'agotado' }, { replace: true })} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={categoriaFilter} onChange={(e) => setFilter('categoria', e.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={estadoFilter} onChange={(e) => setFilter('estado', e.target.value)} aria-label="Filtrar por estado">
          <option value="">Visibles y ocultos</option>
          <option value="activo">Solo visibles</option>
          <option value="inactivo">Solo ocultos</option>
        </select>
        <select className="input w-auto" value={stockFilter} onChange={(e) => setFilter('stock', e.target.value)} aria-label="Filtrar por stock">
          <option value="">Cualquier stock</option>
          <option value="disponible">Con stock</option>
          <option value="bajo">Stock bajo (menos de 10)</option>
          <option value="agotado">Agotados</option>
        </select>
        {hasFilters && (
          <button type="button" onClick={() => setParams({}, { replace: true })} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            <X className="h-4 w-4" /> Quitar filtros
          </button>
        )}
      </div>

      {selected.size > 0 && (
        // Flotante abajo: aparecer no desplaza la tabla (si no, el siguiente clic caería en otra fila).
        <div
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl lg:left-64"
          role="region"
          aria-label="Acciones en lote"
        >
          <span className="font-semibold">{selected.size} seleccionado(s)</span>
          <button type="button" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => void runBulk('activo')} disabled={bulkStatus.isPending}>
            <Eye className="mr-1 inline h-4 w-4" /> Mostrar en la tienda
          </button>
          <button type="button" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => void runBulk('inactivo')} disabled={bulkStatus.isPending}>
            <EyeOff className="mr-1 inline h-4 w-4" /> Ocultar
          </button>
          <button type="button" className="rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20" onClick={() => exportCsv(all.filter((p) => selected.has(p.id)))}>
            <Download className="mr-1 inline h-4 w-4" /> Exportar selección
          </button>
          <button type="button" className="ml-auto text-slate-300 hover:text-white" onClick={() => setSelected(new Set())}>
            Quitar selección
          </button>
        </div>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(p) => p.id}
        searchText={(p) => `${p.id} ${p.nombre} ${p.codigoBarras ?? ''} ${p.categoria ?? ''} ${p.familia ?? ''} ${p.marca ?? ''}`}
        searchPlaceholder="Buscar por nombre, código, marca..."
        emptyMessage={hasFilters ? 'Ningún producto coincide con los filtros.' : 'Aún no hay productos.'}
        initialSort={stockFilter ? { header: 'Stock', dir: 1 } : undefined}
        selection={{ selected, onChange: setSelected }}
        onFilteredChange={setVisibleKeys}
      />

      {/* Espacio para que la barra flotante no tape la paginación. */}
      {selected.size > 0 && <div className="h-20" aria-hidden="true" />}

      <ProductFormModal product={editing} open={modalOpen} onClose={closeModal} />
    </>
  );
}
