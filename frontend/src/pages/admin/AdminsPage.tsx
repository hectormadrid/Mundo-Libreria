import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { SessionAdmin } from '../../lib/types';
import { isStrongPassword, passwordRule } from '../../lib/format';
import { confirmAction, toastError, toastSuccess } from '../../lib/alerts';
import { useSession } from '../../hooks/useSession';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { ErrorState, FormError, Modal, PageLoader, Spinner } from '../../components/ui';
import { PasswordField, PasswordStrength } from '../../components/store/FormField';

function CreateAdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const close = () => {
    setNombre('');
    setPassword('');
    setFormError(null);
    onClose();
  };

  const create = useMutation({
    mutationFn: () => api<SessionAdmin>('/admin/admins', { method: 'POST', body: { nombre, password } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      toastSuccess('Administrador creado');
      close();
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isStrongPassword(password)) return setFormError(passwordRule);
    create.mutate();
  };

  return (
    <Modal open={open} onClose={close} title="Nuevo administrador">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="a-nombre">Usuario *</label>
          <input id="a-nombre" className="input" required autoComplete="off" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <PasswordField id="a-password" label="Contraseña *" value={password} onChange={setPassword} autoComplete="new-password">
          <PasswordStrength password={password} />
        </PasswordField>
        <FormError message={formError} />
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-ghost" onClick={close}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending && <Spinner className="h-4 w-4" />} Crear
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AdminsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [creating, setCreating] = useState(false);
  const admins = useQuery({ queryKey: ['admin', 'admins'], queryFn: () => api<SessionAdmin[]>('/admin/admins') });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/admins/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      toastSuccess('Administrador eliminado');
    },
    onError: toastError,
  });

  const handleDelete = async (admin: SessionAdmin) => {
    if (await confirmAction(`¿Eliminar a "${admin.nombre}"?`, 'Perderá el acceso al panel de administración.', 'Sí, eliminar')) {
      remove.mutate(admin.id);
    }
  };

  return (
    <>
      <AdminPageHeader title="Administradores">
        <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nuevo administrador
        </button>
      </AdminPageHeader>

      {admins.isPending ? (
        <PageLoader />
      ) : admins.error ? (
        <ErrorState error={admins.error} onRetry={() => void admins.refetch()} />
      ) : (
        <ul className="card max-w-2xl divide-y divide-gray-100">
          {admins.data.map((admin) => {
            const isMe = admin.id === session?.admin?.id;
            return (
              <li key={admin.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-100 p-2 text-lib-blue">
                    <Shield className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">{admin.nombre}</span>
                  {isMe && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Tú</span>}
                </div>
                {!isMe && (
                  <button
                    type="button"
                    className="btn-ghost px-3 py-1.5 text-sm text-lib-red"
                    onClick={() => void handleDelete(admin)}
                    disabled={remove.isPending}
                    aria-label={`Eliminar a ${admin.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <CreateAdminModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
