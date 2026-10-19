import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminCustomer, AdminCustomerDetail, Profile } from '../../lib/types';
import { formatDate, formatNumber, formatPrice, formatRut, PAYMENT_METHOD } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { csvDate, downloadCsv } from '../../lib/csv';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ErrorState, FormError, Modal, PageLoader, Spinner, StatusBadge } from '../../components/ui';

function EditUserModal({ user, onClose }: { user: AdminCustomer | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ rut: '', nombre: '', correo: '', telefono: '', direccion: '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({ rut: user.rut, nombre: user.nombre, correo: user.correo, telefono: user.telefono ?? '', direccion: user.direccion ?? '' });
      setFormError(null);
    }
  }, [user]);

  const save = useMutation({
    mutationFn: () => api<Profile>(`/admin/users/${user!.id}`, { method: 'PUT', body: form }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toastSuccess('Cliente actualizado');
      onClose();
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  };

  return (
    <Modal open={user !== null} onClose={onClose} title="Editar cliente">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="u-rut">RUT *</label>
            <input id="u-rut" className="input" required value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })} />
          </div>
          <div>
            <label className="label" htmlFor="u-telefono">Teléfono</label>
            <input id="u-telefono" className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="u-nombre">Nombre *</label>
          <input id="u-nombre" className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="u-correo">Correo *</label>
          <input id="u-correo" type="email" className="input" required value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="u-direccion">Dirección</label>
          <textarea id="u-direccion" rows={2} className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        </div>
        <FormError message={formError} />
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner className="h-4 w-4" />} Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CustomerModal({ id, onClose, onEdit }: { id: number | null; onClose: () => void; onEdit: (c: AdminCustomer) => void }) {
  const { data: c, isPending, error } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => api<AdminCustomerDetail>(`/admin/users/${id}`),
    enabled: id !== null,
  });

  return (
    <Modal open={id !== null} onClose={onClose} title="Ficha del cliente" size="lg">
      {isPending ? (
        <PageLoader />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lib-red to-lib-blue text-lg font-bold text-white">
                {c.nombre.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-lg font-semibold text-gray-900">{c.nombre}</p>
                <p className="text-sm text-gray-500">
                  RUT {c.rut} · cliente desde {formatDate(c.creadoEn)}
                </p>
              </div>
            </div>
            <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => onEdit(c)}>
              <Pencil className="h-4 w-4" /> Editar
            </button>
          </div>

          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">Total pagado</dt>
              <dd className="text-xl font-semibold">{formatPrice(c.totalGastado)}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">Pedidos</dt>
              <dd className="text-xl font-semibold">{formatNumber(c.pedidos)}</dd>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <dt className="text-xs text-gray-500">Último pedido</dt>
              <dd className="text-base font-semibold">{c.ultimoPedido ? formatDate(c.ultimoPedido) : '—'}</dd>
            </div>
          </dl>

          <ul className="space-y-1.5 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${c.correo}`} className="text-lib-blue hover:underline">
                {c.correo}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" /> {c.telefono || 'Sin teléfono'}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> {c.direccion || 'Sin dirección'}
            </li>
          </ul>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900">Pedidos</h3>
            {c.historialPedidos.length === 0 ? (
              <p className="text-sm text-gray-500">Este cliente aún no tiene pedidos.</p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                {c.historialPedidos.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                    <Link to={`/admin/pedidos?ver=${o.id}`} className="font-semibold text-lib-blue hover:underline">
                      #{o.id}
                    </Link>
                    <span className="text-gray-500">{formatDate(o.fecha)}</span>
                    <span className="text-gray-500">{o.metodoPago ? PAYMENT_METHOD[o.metodoPago] : ''}</span>
                    <span className="ml-auto">
                      <StatusBadge status={o.estado} />
                    </span>
                    <span className="w-24 text-right font-semibold tabular-nums">{formatPrice(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const verParam = Number(params.get('ver'));
  const viewing = Number.isInteger(verParam) && verParam > 0 ? verParam : null;
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<(string | number)[]>([]);
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: () => api<AdminCustomer[]>('/admin/users') });
  const all = useMemo(() => users.data ?? [], [users.data]);

  const setVer = (id: number | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('ver', String(id));
    else next.delete('ver');
    setParams(next);
  };

  const remove = useMutation({
    mutationFn: (id: number) => api<{ id: number }>(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toastSuccess('Cliente eliminado');
    },
    onError: toastError,
  });

  const handleDelete = async (user: AdminCustomer) => {
    if (await confirmAction('¿Eliminar cliente?', `Se eliminará la cuenta de ${user.nombre}. Esta acción no se puede deshacer.`, 'Sí, eliminar')) {
      remove.mutate(user.id);
    }
  };

  const resumen = useMemo(
    () => ({
      total: all.length,
      conCompras: all.filter((u) => u.totalGastado > 0).length,
      nuevos30: all.filter((u) => Date.now() - new Date(u.creadoEn).getTime() < 30 * 24 * 60 * 60 * 1000).length,
    }),
    [all],
  );

  const byKey = useMemo(() => new Map(all.map((u) => [u.id, u])), [all]);
  const visibleRows = visibleKeys.map((k) => byKey.get(Number(k))).filter((u): u is AdminCustomer => Boolean(u));

  const exportCsv = () =>
    downloadCsv('clientes', visibleRows, [
      { header: 'ID', value: (u) => u.id },
      { header: 'RUT', value: (u) => u.rut },
      { header: 'Nombre', value: (u) => u.nombre },
      { header: 'Correo', value: (u) => u.correo },
      { header: 'Teléfono', value: (u) => u.telefono },
      { header: 'Dirección', value: (u) => u.direccion },
      { header: 'Pedidos', value: (u) => u.pedidos },
      { header: 'Total pagado', value: (u) => u.totalGastado },
      { header: 'Último pedido', value: (u) => csvDate(u.ultimoPedido) },
      { header: 'Registrado', value: (u) => csvDate(u.creadoEn) },
    ]);

  const columns: Column<AdminCustomer>[] = [
    {
      header: 'Cliente',
      cell: (u) => (
        <button type="button" onClick={() => setVer(u.id)} className="text-left">
          <p className="font-semibold text-gray-900 hover:text-lib-blue">{u.nombre}</p>
          <p className="text-xs text-gray-500">{u.correo}</p>
        </button>
      ),
      sortValue: (u) => u.nombre,
    },
    { header: 'RUT', cell: (u) => <span className="whitespace-nowrap">{u.rut}</span>, sortValue: (u) => u.rut },
    { header: 'Pedidos', cell: (u) => formatNumber(u.pedidos), sortValue: (u) => u.pedidos },
    { header: 'Total pagado', cell: (u) => <span className="font-semibold tabular-nums">{formatPrice(u.totalGastado)}</span>, sortValue: (u) => u.totalGastado, className: 'whitespace-nowrap' },
    { header: 'Último pedido', cell: (u) => (u.ultimoPedido ? formatDate(u.ultimoPedido) : <span className="text-gray-400">—</span>), sortValue: (u) => u.ultimoPedido ?? '', className: 'whitespace-nowrap' },
    { header: 'Registrado', cell: (u) => formatDate(u.creadoEn), sortValue: (u) => u.creadoEn, className: 'whitespace-nowrap text-gray-600' },
    {
      header: 'Acciones',
      cell: (u) => (
        <div className="flex gap-1">
          <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-lib-blue" onClick={() => setVer(u.id)} title="Ver ficha" aria-label={`Ver ficha de ${u.nombre}`}>
            <Eye className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-lib-blue" onClick={() => setEditing(u)} title="Editar" aria-label={`Editar ${u.nombre}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-lib-red disabled:opacity-30"
            onClick={() => void handleDelete(u)}
            disabled={u.pedidos > 0 || remove.isPending}
            title={u.pedidos > 0 ? 'No se puede eliminar: tiene pedidos registrados' : 'Eliminar cliente'}
            aria-label={`Eliminar ${u.nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (users.isPending) return <PageLoader />;
  if (users.error) return <ErrorState error={users.error} onRetry={() => void users.refetch()} />;

  return (
    <>
      <AdminPageHeader title="Clientes" subtitle={`${formatNumber(resumen.total)} registrados · ${formatNumber(resumen.conCompras)} con compras pagadas · ${formatNumber(resumen.nuevos30)} nuevos en 30 días`}>
        <button type="button" className="btn-ghost" onClick={exportCsv} disabled={!visibleRows.length}>
          <Download className="h-4 w-4" /> Exportar
        </button>
      </AdminPageHeader>
      <DataTable
        rows={all}
        columns={columns}
        rowKey={(u) => u.id}
        searchText={(u) => `${u.rut} ${u.nombre} ${u.correo} ${u.telefono ?? ''}`}
        searchPlaceholder="Buscar por RUT, nombre o correo..."
        emptyMessage="Aún no hay clientes registrados."
        initialSort={{ header: 'Total pagado', dir: -1 }}
        onFilteredChange={setVisibleKeys}
      />
      <CustomerModal id={viewing} onClose={() => setVer(null)} onEdit={(c) => {
          setVer(null);
          setEditing(c);
        }}
      />
      <EditUserModal user={editing} onClose={() => setEditing(null)} />
    </>
  );
}
