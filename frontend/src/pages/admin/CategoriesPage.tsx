import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminCategory } from '../../lib/types';
import { formatDate } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { DataTable, type Column } from '../../components/admin/DataTable';
import { ErrorState, FormError, Modal, PageLoader, Spinner } from '../../components/ui';

type Editing = AdminCategory | 'new' | null;

function CategoryModal({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const isNew = editing === 'new';

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? api('/admin/categories', { method: 'POST', body: { nombre } })
        : api(`/admin/categories/${(editing as AdminCategory).id}`, { method: 'PUT', body: { nombre } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toastSuccess(isNew ? 'Categoría creada' : 'Categoría actualizada');
      onClose();
    },
  });

  useEffect(() => {
    setNombre(editing && editing !== 'new' ? editing.nombre : '');
    save.reset();
  }, [editing]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <Modal open={editing !== null} onClose={onClose} title={isNew ? 'Nueva categoría' : 'Editar categoría'}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="c-nombre">Nombre *</label>
          <input id="c-nombre" className="input" required maxLength={100} value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
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

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Editing>(null);
  const categories = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api<AdminCategory[]>('/admin/categories') });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toastSuccess('Categoría eliminada');
    },
    onError: toastError,
  });

  const handleDelete = async (c: AdminCategory) => {
    const detalle =
      c.productos || c.familias
        ? `Se eliminarán sus ${c.familias} familia(s) y ${c.productos} producto(s) quedarán sin categoría.`
        : 'Esta acción no se puede deshacer.';
    if (await confirmAction(`¿Eliminar "${c.nombre}"?`, detalle, 'Sí, eliminar')) remove.mutate(c.id);
  };

  const columns: Column<AdminCategory>[] = [
    { header: 'ID', cell: (c) => c.id, sortValue: (c) => c.id },
    { header: 'Nombre', cell: (c) => <span className="font-semibold">{c.nombre}</span>, sortValue: (c) => c.nombre },
    { header: 'Familias', cell: (c) => c.familias, sortValue: (c) => c.familias },
    { header: 'Productos', cell: (c) => c.productos, sortValue: (c) => c.productos },
    { header: 'Creada', cell: (c) => formatDate(c.fechaCreacion), sortValue: (c) => c.fechaCreacion },
    {
      header: 'Acciones',
      cell: (c) => (
        <div className="flex gap-2">
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setEditing(c)} aria-label={`Editar ${c.nombre}`}>
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" className="btn-ghost px-3 py-1.5 text-sm text-lib-red" onClick={() => void handleDelete(c)} disabled={remove.isPending} aria-label={`Eliminar ${c.nombre}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Categorías">
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Nueva categoría
        </button>
      </AdminPageHeader>
      {categories.isPending ? (
        <PageLoader />
      ) : categories.error ? (
        <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <DataTable rows={categories.data} columns={columns} rowKey={(c) => c.id} searchText={(c) => c.nombre} emptyMessage="Aún no hay categorías." />
      )}
      <CategoryModal editing={editing} onClose={() => setEditing(null)} />
    </>
  );
}
