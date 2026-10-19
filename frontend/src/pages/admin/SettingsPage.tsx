import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Landmark, Plus, Save, Share2, Store, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import type { Horario, StoreSettings } from '../../lib/types';
import { toastSuccess } from '../../lib/alerts';
import { settingsKey, useStoreSettings } from '../../hooks/useSettings';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { ErrorState, FormError, PageLoader, Spinner } from '../../components/ui';

type Form = Omit<StoreSettings, 'horarios'> & { horarios: Horario[] };

const EMPTY: Form = { telefono: '', correo: '', direccion: '', whatsapp: '', instagram: '', facebook: '', horarios: [], datosTransferencia: '' };

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="card grid gap-6 p-6 lg:grid-cols-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          {icon} {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="space-y-4 lg:col-span-2">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useStoreSettings();
  const [form, setForm] = useState<Form>(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data) {
      const s = settings.data;
      setForm({
        telefono: s.telefono ?? '',
        correo: s.correo ?? '',
        direccion: s.direccion ?? '',
        whatsapp: s.whatsapp ?? '',
        instagram: s.instagram ?? '',
        facebook: s.facebook ?? '',
        horarios: s.horarios.length ? s.horarios : [{ dia: '', horario: '' }],
        datosTransferencia: s.datosTransferencia ?? '',
      });
    }
  }, [settings.data]);

  const save = useMutation({
    mutationFn: () => api<StoreSettings>('/admin/settings', { method: 'PUT', body: form }),
    onSuccess: (updated) => {
      queryClient.setQueryData(settingsKey, updated);
      toastSuccess('Configuración guardada: los cambios ya se ven en la tienda');
    },
    onError: (error) => setFormError(error.message),
  });

  if (settings.isPending) return <PageLoader />;
  if (settings.error) return <ErrorState error={settings.error} onRetry={() => void settings.refetch()} />;

  const set = (key: keyof Omit<Form, 'horarios'>) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });
  const setHorario = (i: number, key: keyof Horario, value: string) =>
    setForm({ ...form, horarios: form.horarios.map((h, j) => (j === i ? { ...h, [key]: value } : h)) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  };

  return (
    <form onSubmit={submit}>
      <AdminPageHeader title="Configuración de la tienda" subtitle="Datos que ven tus clientes en el pie de página, en Contacto y en el checkout">
        <button type="submit" className="btn-primary" disabled={save.isPending}>
          {save.isPending ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />} Guardar cambios
        </button>
      </AdminPageHeader>

      <div className="space-y-6">
        <FormError message={formError} />

        <Section icon={<Store className="h-5 w-5 text-lib-blue" />} title="Contacto" description="Se muestran en la página de Contacto.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-telefono">Teléfono</label>
              <input id="s-telefono" className="input" maxLength={30} value={form.telefono ?? ''} onChange={set('telefono')} placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className="label" htmlFor="s-correo">Correo</label>
              <input id="s-correo" type="email" className="input" value={form.correo ?? ''} onChange={set('correo')} placeholder="contacto@tienda.cl" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="s-direccion">Dirección</label>
            <input id="s-direccion" className="input" maxLength={255} value={form.direccion ?? ''} onChange={set('direccion')} />
          </div>
        </Section>

        <Section icon={<Clock className="h-5 w-5 text-lib-blue" />} title="Horarios de atención" description="Aparecen en el pie de página de toda la tienda.">
          <ul className="space-y-2">
            {form.horarios.map((h, i) => (
              <li key={i} className="flex items-center gap-2">
                <input className="input" placeholder="Días (ej.: Lunes - Viernes)" value={h.dia} maxLength={50} onChange={(e) => setHorario(i, 'dia', e.target.value)} aria-label={`Días de la fila ${i + 1}`} />
                <input className="input" placeholder="Horario (ej.: 9:00 - 20:00 o Cerrado)" value={h.horario} maxLength={50} onChange={(e) => setHorario(i, 'horario', e.target.value)} aria-label={`Horario de la fila ${i + 1}`} />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, horarios: form.horarios.filter((_, j) => j !== i) })}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-lib-red"
                  aria-label={`Quitar la fila ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {form.horarios.length < 10 && (
            <button type="button" className="btn-ghost px-3 py-1.5 text-sm" onClick={() => setForm({ ...form, horarios: [...form.horarios, { dia: '', horario: '' }] })}>
              <Plus className="h-4 w-4" /> Agregar fila
            </button>
          )}
        </Section>

        <Section icon={<Share2 className="h-5 w-5 text-lib-blue" />} title="Redes sociales" description="Enlaces de los íconos del pie de página. Deja vacío lo que no uses: el ícono se oculta.">
          {(['whatsapp', 'instagram', 'facebook'] as const).map((key) => (
            <div key={key}>
              <label className="label capitalize" htmlFor={`s-${key}`}>
                {key === 'whatsapp' ? 'WhatsApp' : key === 'instagram' ? 'Instagram' : 'Facebook'}
              </label>
              <input
                id={`s-${key}`}
                type="url"
                className="input"
                value={form[key] ?? ''}
                onChange={set(key)}
                placeholder={key === 'whatsapp' ? 'https://wa.me/56912345678' : `https://www.${key}.com/tutienda`}
              />
            </div>
          ))}
        </Section>

        <Section
          icon={<Landmark className="h-5 w-5 text-lib-blue" />}
          title="Datos para transferencia"
          description="Se muestran en el checkout al elegir transferencia y en el correo de confirmación del pedido."
        >
          <textarea
            id="s-transferencia"
            rows={5}
            maxLength={1000}
            className="input"
            value={form.datosTransferencia ?? ''}
            onChange={set('datosTransferencia')}
            placeholder={'Banco: ...\nTipo de cuenta: ...\nNúmero: ...\nRUT: ...\nCorreo para el comprobante: ...'}
            aria-label="Datos para transferencia"
          />
        </Section>
      </div>
    </form>
  );
}
