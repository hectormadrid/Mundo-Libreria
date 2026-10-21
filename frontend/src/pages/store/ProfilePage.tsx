import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, IdCard, KeyRound, Lock, Mail, MapPin, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { api } from '../../lib/api';
import type { Profile, Session } from '../../lib/types';
import { isStrongPassword, passwordRule } from '../../lib/format';
import { toastSuccess } from '../../lib/alerts';
import { sessionKey } from '../../hooks/useSession';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ErrorState, FormError, Spinner } from '../../components/ui';
import { AccountShell, useOrders } from '../../components/store/AccountShell';
import { Field, PasswordField, PasswordStrength, fieldInput } from '../../components/store/FormField';
import { OrderCard } from './OrdersPage';

export function ProfilePage() {
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<Profile>('/profile') });
  const orders = useOrders();
  useDocumentTitle('Mi perfil');

  return (
    <AccountShell>
      {profile.isPending ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="skeleton h-[28rem] rounded-[2rem]" />
          <div className="skeleton h-80 rounded-[2rem]" />
        </div>
      ) : profile.error ? (
        <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]">
          <PersonalData profile={profile.data} />
          <div className="space-y-6">
            <PasswordCard />
            {orders.data && orders.data.length > 0 && (
              <Card icon={<ArrowRight className="h-5 w-5" />} title="Tu último pedido">
                <OrderCard order={orders.data[0]} />
                <Link to="/mis-pedidos" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900">
                  Ver todos mis pedidos <ArrowRight className="h-4 w-4" />
                </Link>
              </Card>
            )}
          </div>
        </div>
      )}
    </AccountShell>
  );
}

function Card({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PersonalData({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nombre: profile.nombre, telefono: profile.telefono ?? '', direccion: profile.direccion ?? '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setForm({ nombre: profile.nombre, telefono: profile.telefono ?? '', direccion: profile.direccion ?? '' });
  }, [profile]);

  const dirty = form.nombre !== profile.nombre || form.telefono !== (profile.telefono ?? '') || form.direccion !== (profile.direccion ?? '');

  const save = useMutation({
    mutationFn: () => api<Profile>('/profile', { method: 'PUT', body: form }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      queryClient.setQueryData<Session>(sessionKey, (s) => (s?.user ? { ...s, user: { ...s.user, nombre: updated.nombre } } : s));
      toastSuccess('Tus datos se guardaron');
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  };

  return (
    <Card icon={<User className="h-5 w-5" />} title="Datos personales" subtitle="Se usan para completar tus compras más rápido.">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="rut" label="RUT" hint="No se puede cambiar." icon={<IdCard className="h-5 w-5" />}>
            <input id="rut" className={fieldInput()} value={profile.rut} disabled />
          </Field>
          <Field id="correo" label="Correo" hint="No se puede cambiar." icon={<Mail className="h-5 w-5" />}>
            <input id="correo" className={fieldInput()} value={profile.correo} disabled />
          </Field>
        </div>
        <Field id="nombre" label="Nombre completo" icon={<User className="h-5 w-5" />}>
          <input id="nombre" className={fieldInput()} required maxLength={100} autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </Field>
        <Field id="telefono" label="Teléfono" icon={<Phone className="h-5 w-5" />}>
          <input id="telefono" type="tel" className={fieldInput()} placeholder="+56912345678" autoComplete="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        </Field>
        <Field id="direccion" label="Dirección de envío" hint="La usaremos por defecto en tus compras." icon={<MapPin className="h-5 w-5" />}>
          <input id="direccion" className={fieldInput()} maxLength={255} autoComplete="street-address" placeholder="Calle, número, depto. y comuna" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        </Field>
        <FormError message={formError} />
        <button type="submit" disabled={save.isPending || !dirty} className="btn-brand h-12 px-8">
          {save.isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar cambios
        </button>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => api<{ message: string }>('/profile/password', { method: 'PUT', body: { actual: form.actual, nueva: form.nueva } }),
    onSuccess: ({ message }) => {
      toastSuccess(message);
      setForm({ actual: '', nueva: '', confirmar: '' });
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isStrongPassword(form.nueva)) return setFormError(passwordRule);
    if (form.nueva !== form.confirmar) return setFormError('Las contraseñas nuevas no coinciden.');
    change.mutate();
  };

  const mismatch = form.confirmar.length > 0 && form.confirmar !== form.nueva;

  return (
    <Card icon={<ShieldCheck className="h-5 w-5" />} title="Seguridad" subtitle="Cambia tu contraseña cuando quieras.">
      <form onSubmit={submit} className="space-y-5">
        <PasswordField id="actual" label="Contraseña actual" value={form.actual} onChange={(actual) => setForm({ ...form, actual })} autoComplete="current-password" />
        <PasswordField id="nueva" label="Nueva contraseña" value={form.nueva} onChange={(nueva) => setForm({ ...form, nueva })} autoComplete="new-password">
          {form.nueva && <PasswordStrength password={form.nueva} />}
        </PasswordField>
        <PasswordField
          id="confirmar-nueva"
          label="Repite la nueva contraseña"
          value={form.confirmar}
          onChange={(confirmar) => setForm({ ...form, confirmar })}
          autoComplete="new-password"
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
        />
        <FormError message={formError} />
        <button type="submit" disabled={change.isPending} className="btn-outline h-12 w-full">
          {change.isPending ? <Spinner className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />} Cambiar contraseña
        </button>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" /> Nunca te pediremos tu contraseña por correo ni por WhatsApp.
        </p>
      </form>
    </Card>
  );
}
