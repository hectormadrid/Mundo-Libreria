import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowUpRight, CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send, User } from 'lucide-react';
import { api } from '../../lib/api';
import { useStoreSettings } from '../../hooks/useSettings';
import { useSession } from '../../hooks/useSession';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { FormError, Spinner } from '../../components/ui';
import { Field, fieldInput } from '../../components/store/FormField';
import { GlobeLines } from '../../components/store/GlobeLines';
import { InstagramIcon, FacebookIcon, WhatsAppIcon } from '../../components/store/Footer';

const MAP_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.073263522781!2d-70.6576055!3d-34.0370029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966347baf26041cd%3A0x85a209dac1ce737a!2sMundo%20Librer%C3%ADa!5e0!3m2!1ses-419!2sar!4v1722382929430!5m2!1ses-419!2sar';

export function ContactPage() {
  const { data: settings } = useStoreSettings();
  useDocumentTitle('Contacto');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        <GlobeLines className="pointer-events-none absolute -top-24 -right-16 h-[26rem] w-[26rem] text-white/[0.07]" />
        <div className="shell relative pt-14 pb-28">
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-sun-300 uppercase">Contacto</p>
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-semibold sm:text-5xl">
            Hablemos. <span className="italic text-sun-400">Estamos para ayudarte.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">¿Buscas un producto, tienes dudas con un pedido o quieres cotizar? Escríbenos por donde te acomode.</p>
        </div>
      </section>

      <div className="shell relative z-10 -mt-16 grid items-start gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          {settings?.whatsapp && (
            <a
              href={settings.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-[2rem] bg-emerald-500 p-6 text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <WhatsAppIcon className="h-7 w-7" />
              </span>
              <span className="flex-1">
                <strong className="block text-lg">Escríbenos por WhatsApp</strong>
                <span className="text-sm text-white/85">La forma más rápida de hablar con nosotros.</span>
              </span>
              <ArrowUpRight className="h-6 w-6 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {settings?.telefono && (
              <ContactCard icon={<Phone className="h-5 w-5" />} label="Llámanos" value={settings.telefono} href={`tel:${settings.telefono.replace(/[^\d+]/g, '')}`} />
            )}
            {settings?.correo && <ContactCard icon={<Mail className="h-5 w-5" />} label="Correo" value={settings.correo} href={`mailto:${settings.correo}`} />}
          </div>

          {settings?.direccion && (
            <ContactCard
              icon={<MapPin className="h-5 w-5" />}
              label="Visítanos"
              value={settings.direccion}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.direccion)}`}
              action="Cómo llegar"
            />
          )}

          {settings && settings.horarios.length > 0 && (
            <div className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70">
              <p className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                <Clock className="h-5 w-5 text-brand-600" /> Horario de atención
              </p>
              <dl className="divide-y divide-slate-100 text-sm">
                {settings.horarios.map((h, i) => (
                  <div key={i} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-slate-600">{h.dia}</dt>
                    <dd className={`font-semibold ${/cerrado/i.test(h.horario) ? 'text-cherry-600' : 'text-slate-900'}`}>{h.horario}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(settings?.instagram || settings?.facebook) && (
            <div className="flex items-center gap-3 rounded-[2rem] bg-white p-5 ring-1 ring-slate-200/70">
              <span className="flex-1 text-sm font-semibold text-slate-700">Síguenos</span>
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand-600 hover:text-white">
                  <InstagramIcon />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand-600 hover:text-white">
                  <FacebookIcon />
                </a>
              )}
            </div>
          )}
        </div>

        <ContactForm />
      </div>

      <section className="shell pt-12">
        <div className="h-[26rem] overflow-hidden rounded-[2rem] ring-1 ring-slate-200/70">
          <iframe title="Ubicación de Mundo Librería" src={MAP_URL} className="h-full w-full border-0" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon, label, value, href, action }: { icon: ReactNode; label: string; value: string; href: string; action?: string }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-4 rounded-[2rem] bg-white p-5 ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-900/5 hover:ring-brand-200"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold tracking-wider text-slate-500 uppercase">{label}</span>
        <span className="block font-semibold break-words text-slate-900">{value}</span>
        {action && <span className="text-sm font-bold text-brand-700">{action} →</span>}
      </span>
    </a>
  );
}

function ContactForm() {
  const { data: session } = useSession();
  const empty = { nombre: session?.user?.nombre ?? '', correo: session?.user?.correo ?? '', telefono: '', mensaje: '', sitio: '' };
  const [form, setForm] = useState(empty);
  const box = useRef<HTMLElement>(null);
  const send = useMutation({
    mutationFn: () => api<{ message: string }>('/contact', { method: 'POST', body: form }),
    onSuccess: () => {
      setForm((f) => ({ ...f, telefono: '', mensaje: '', sitio: '' }));
      // El formulario se reemplaza por un aviso más corto: mantenerlo a la vista.
      requestAnimationFrame(() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    },
  });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  // Con sesión iniciada, completar nombre y correo (sin pisar lo que ya se escribió).
  const user = session?.user;
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, nombre: f.nombre || user.nombre, correo: f.correo || user.correo }));
  }, [user]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send.mutate();
  };

  return (
    <section ref={box} className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-brand-950/10 ring-1 ring-slate-200/70 sm:p-8">
      <h2 className="font-display text-3xl font-semibold text-slate-900">Envíanos un mensaje</h2>
      <p className="mt-1 mb-7 text-slate-600">Te responderemos al correo que indiques.</p>

      {send.isSuccess ? (
        <div className="rounded-3xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200" role="status">
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
          <p className="text-lg font-bold text-emerald-900">¡Mensaje enviado!</p>
          <p className="mt-1 text-emerald-800">{send.data.message}</p>
          <button type="button" onClick={() => send.reset()} className="mt-5 text-sm font-bold text-brand-700 hover:text-brand-900">
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="c-nombre" label="Nombre" icon={<User className="h-5 w-5" />}>
              <input id="c-nombre" className={fieldInput()} required maxLength={100} autoComplete="name" value={form.nombre} onChange={set('nombre')} />
            </Field>
            <Field id="c-correo" label="Correo" icon={<Mail className="h-5 w-5" />}>
              <input id="c-correo" type="email" className={fieldInput()} required autoComplete="email" value={form.correo} onChange={set('correo')} />
            </Field>
          </div>
          <Field id="c-telefono" label="Teléfono (opcional)" icon={<Phone className="h-5 w-5" />}>
            <input id="c-telefono" type="tel" className={fieldInput()} maxLength={20} autoComplete="tel" placeholder="+56 9 1234 5678" value={form.telefono} onChange={set('telefono')} />
          </Field>
          <div>
            <label htmlFor="c-mensaje" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Mensaje
            </label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
              <textarea
                id="c-mensaje"
                rows={5}
                required
                minLength={10}
                maxLength={2000}
                value={form.mensaje}
                onChange={set('mensaje')}
                placeholder="Cuéntanos qué necesitas..."
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white py-3 pr-4 pl-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">{form.mensaje.length}/2000</p>
          </div>
          {/* Campo trampa para robots: invisible para las personas. */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="c-sitio">Sitio web</label>
            <input id="c-sitio" tabIndex={-1} autoComplete="off" value={form.sitio} onChange={set('sitio')} />
          </div>
          <FormError message={send.error?.message ?? null} />
          <button type="submit" disabled={send.isPending} className="btn-brand h-14 w-full text-base">
            {send.isPending ? <Spinner /> : <Send className="h-5 w-5" />} Enviar mensaje
          </button>
        </form>
      )}
    </section>
  );
}
