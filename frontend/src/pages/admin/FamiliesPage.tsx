import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminFamily } from '../../lib/types';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { useCategories } from '../../components/store/CategoryNav';
import { ErrorState, FormError, Modal, PageLoader, Spinner } from '../../components/ui';

type Editing = AdminFamily | 'new' | null;

function FamilyModal({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [form, setForm] = useState({ nombre: '', idCategoria: '' });
  const isNew = editing === 'new';

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? api('/admin/families', { method: 'POST', body: form })
        : api(`/admin/families/${(editing as AdminFamily).id}`, { method: 'PUT', body: form }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['families'] });
      toastSuccess(isNew ? 'Familia creada' : 'Familia actualizada');
      onClose();
    },
  });

  useEffect(() => {
    setForm(editing && editing !== 'new' ? { nombre: editing.nombre, idCategoria: String(editing.idCategoria) } : { nombre: '', idCategoria: '' });
    save.reset();
  }, [editing]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  const moved = editing && editing !== 'new' && editing.productos > 0 && form.idCategoria !== String(editing.idCategoria);

  return (
    <Modal open={editing !== null} onClose={onClose} title={isNew ? 'Nueva familia' : 'Editar familia'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="f-nombre">Nombre *</label>
          <input id="f-nombre" className="input" required maxLength={100} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
        </div>
        <div>
          <label className="label" htmlFor="f-categoria">Categoría *</label>
          <select id="f-categoria" className="input" required value={form.idCategoria} onChange={(e) => setForm({ ...form, idCategoria: e.target.value })}>
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {moved && <p className="mt-1 text-xs text-orange-600">Sus productos también pasarán a la nueva categoría.</p>}
        </div>
        <FormError message={save.error?.message ?? null} />
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

export function FamiliesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Editing>(null);
  const families = useQuery({ queryKey: ['admin', 'families'], queryFn: () => api<AdminFamily[]>('/admin/families') });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/families/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['families'] });
      toastSuccess('Familia eliminada');
    },
    onError: toastError,
  });

  const handleDelete = async (f: AdminFamily) => {
    const detalle = f.productos ? `${f.productos} producto(s) quedarán sin familia.` : 'Esta acción no se puede deshacer.';
    if (await confirmAction(`¿Eliminar "${f.nombre}"?`, detalle, 'Sí, eliminar')) remove.mutate(f.id);
  };

  const columns: Column<AdminFamily>[] = [
    { header: 'ID', cell: (f) => f.id, sortValue: (f) => f.id },
    { header: 'Nombre', cell: (f) => <span className="font-semibold">{f.nombre}</span>, sortValue: (f) => f.nombre },
    { header: 'Categoría', cell: (f) => f.categoria, sortValue: (f) => f.categoria },
    { header: 'Productos', cell: (f) => f.productos, sortValue: (f) => f.productos },
    {
      header: 'Acciones',
      cell: (f) => (
        <div className="flex gap-2">
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setEditing(f)} aria-label={`Editar ${f.nombre}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm text-lib-red" onClick={() => void handleDelete(f)} disabled={remove.isPending} aria-label={`Eliminar ${f.nombre}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Familias">
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Nueva familia
        </button>
      </AdminPageHeader>
      {families.isPending ? (
        <PageLoader />
      ) : families.error ? (
        <ErrorState error={families.error} onRetry={() => void families.refetch()} />
      ) : (
        <DataTable
          rows={families.data}
          columns={columns}
          rowKey={(f) => f.id}
          searchText={(f) => `${f.nombre} ${f.categoria}`}
          emptyMessage="Aún no hay familias."
        />
      )}
      <FamilyModal editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}
