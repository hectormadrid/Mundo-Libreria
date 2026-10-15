import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminCustomer, Profile } from '../../lib/types';
import { formatRut } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ErrorState, FormError, Modal, PageLoader, Spinner } from '../../components/ui';

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
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminCustomer[]>(['admin', 'users'], (list) => list?.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
      toastSuccess('Usuario actualizado');
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
    <Modal open={user !== null} onClose={onClose} title="Editar usuario">
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

export function UsersAdminPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: () => api<AdminCustomer[]>('/admin/users') });

  const remove = useMutation({
    mutationFn: (id: number) => api<{ id: number }>(`/admin/users/${id}`, { method: 'DELETE' }),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<AdminCustomer[]>(['admin', 'users'], (list) => list?.filter((u) => u.id !== id));
      toastSuccess('Usuario eliminado');
    },
    onError: toastError,
  });

  const handleDelete = async (user: AdminCustomer) => {
    if (await confirmAction('¿Eliminar usuario?', `Se eliminará la cuenta de ${user.nombre}. Esta acción no se puede deshacer.`, 'Sí, eliminar')) {
      remove.mutate(user.id);
    }
  };

  const columns: Column<AdminCustomer>[] = [
    { header: 'ID', cell: (u) => u.id, sortValue: (u) => u.id },
    { header: 'RUT', cell: (u) => <span className="whitespace-nowrap">{u.rut}</span>, sortValue: (u) => u.rut },
    {
      header: 'Nombre',
      cell: (u) => (
        <>
          <p className="font-semibold">{u.nombre}</p>
          <p className="text-xs text-gray-500">{u.correo}</p>
        </>
      ),
      sortValue: (u) => u.nombre,
    },
    { header: 'Teléfono', cell: (u) => u.telefono || '—' },
    { header: 'Dirección', cell: (u) => <span className="line-clamp-2 max-w-xs">{u.direccion || '—'}</span> },
    { header: 'Pedidos', cell: (u) => u.pedidos, sortValue: (u) => u.pedidos },
    {
      header: 'Acciones',
      cell: (u) => (
        <div className="flex gap-2">
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setEditing(u)} aria-label={`Editar ${u.nombre}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-sm text-lib-red disabled:opacity-40"
            onClick={() => void handleDelete(u)}
            disabled={u.pedidos > 0 || remove.isPending}
            title={u.pedidos > 0 ? 'No se puede eliminar: tiene pedidos registrados' : 'Eliminar usuario'}
            aria-label={`Eliminar ${u.nombre}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Usuarios" />
      {users.isPending ? (
        <PageLoader />
      ) : users.error ? (
        <ErrorState error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <DataTable
          rows={users.data}
          columns={columns}
          rowKey={(u) => u.id}
          searchText={(u) => `${u.rut} ${u.nombre} ${u.correo} ${u.telefono ?? ''}`}
          searchPlaceholder="Buscar por RUT, nombre o correo..."
          emptyMessage="Aún no hay clientes registrados."
        />
      )}
      <EditUserModal user={editing} onClose={() => setEditing(null)} />
    </>
  );
}
