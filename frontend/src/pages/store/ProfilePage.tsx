import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, UserCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Profile, Session } from '../../lib/types';
import { toastSuccess } from '../../lib/alerts';
import { sessionKey } from '../../hooks/useSession';
import { ErrorState, FormError, PageLoader, Spinner } from '../../components/ui';
import { OrderRow, useOrders } from './OrdersPage';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<Profile>('/profile') });
  const orders = useOrders();
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) {
      setForm({ nombre: profile.data.nombre, telefono: profile.data.telefono ?? '', direccion: profile.data.direccion ?? '' });
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () => api<Profile>('/profile', { method: 'PUT', body: form }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      queryClient.setQueryData<Session>(sessionKey, (s) => (s?.user ? { ...s, user: { ...s.user, nombre: updated.nombre } } : s));
      toastSuccess('Perfil actualizado correctamente');
    },
    onError: (error) => setFormError(error.message),
  });

  if (profile.isPending) return <PageLoader />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lib-red to-lib-blue text-2xl font-bold text-white">
          {profile.data.nombre.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{profile.data.nombre}</h1>
          <p className="text-gray-500">{profile.data.correo}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={submit} className="card space-y-4 p-6 lg:col-span-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UserCircle className="h-5 w-5 text-lib-blue" /> Mis datos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="rut">RUT</label>
              <input id="rut" className="input" value={profile.data.rut} disabled />
            </div>
            <div>
              <label className="label" htmlFor="correo">Correo</label>
              <input id="correo" className="input" value={profile.data.correo} disabled />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="nombre">Nombre completo</label>
            <input id="nombre" className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="telefono">Teléfono</label>
            <input id="telefono" type="tel" className="input" placeholder="+56912345678" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="direccion">Dirección</label>
            <textarea id="direccion" rows={3} className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <FormError message={formError} />
          <button type="submit" disabled={save.isPending} className="btn-primary">
            {save.isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar cambios
          </button>
        </form>

        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Pedidos recientes</h2>
            <Link to="/mis-pedidos" className="text-sm text-lib-blue hover:underline">
              Ver todos
            </Link>
          </div>
          {orders.isPending ? (
            <PageLoader />
          ) : orders.error ? (
            <ErrorState error={orders.error} />
          ) : orders.data.length === 0 ? (
            <p className="card p-6 text-center text-gray-500">Aún no tienes pedidos.</p>
          ) : (
            <div className="space-y-3">
              {orders.data.slice(0, 3).map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
