import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Banknote, Check, ChevronDown, CreditCard, Info, Landmark, Lock, Mail, MapPin, Pencil, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import type { CartItem, PaymentMethod, Profile } from '../../lib/types';
import { formatNumber, formatPrice, PAYMENT_METHOD } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { useCart } from '../../hooks/useCart';
import { useStoreSettings } from '../../hooks/useSettings';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ErrorState, FormError, PageLoader, Spinner } from '../../components/ui';
import { CheckoutSteps, cartItemProblem } from '../../components/store/CartParts';

const METHODS: { id: PaymentMethod; title: string; text: string; icon: typeof CreditCard }[] = [
  { id: 'transferencia', title: 'Transferencia', text: 'Pagas desde tu banco y confirmamos el pago.', icon: Landmark },
  { id: 'tarjeta', title: 'Tarjeta', text: 'Crédito o débito.', icon: CreditCard },
  { id: 'efectivo', title: 'Efectivo', text: 'Pagas al recibir tu pedido.', icon: Banknote },
];

type Contact = { nombre: string; correo: string; telefono: string; direccion: string };
type Confirmed = { id: number; nombre: string; metodo: PaymentMethod; total: number; count: number };

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function CheckoutPage() {
  const queryClient = useQueryClient();
  const { cart, isPending: cartPending } = useCart();
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<Profile>('/profile') });
  useDocumentTitle('Finalizar compra');

  const [step, setStep] = useState(1);
  const [contact, setContact] = useState<Contact>({ nombre: '', correo: '', telefono: '', direccion: '' });
  const [method, setMethod] = useState<PaymentMethod>('transferencia');
  // Los datos de tarjeta nunca se envían al servidor: solo se validan en el navegador.
  const [card, setCard] = useState({ numero: '', vencimiento: '', cvv: '' });
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) {
      setContact({
        nombre: profile.data.nombre,
        correo: profile.data.correo,
        telefono: profile.data.telefono ?? '',
        direccion: profile.data.direccion ?? '',
      });
    }
  }, [profile.data]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, confirmed]);

  const createOrder = useMutation({
    mutationFn: () => api<{ id: number }>('/orders', { method: 'POST', body: { ...contact, metodoPago: method } }),
    onSuccess: ({ id }) => {
      setConfirmed({ id, nombre: contact.nombre, metodo: method, total: cart.total, count: cart.count });
      void queryClient.invalidateQueries({ queryKey: ['cart'] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => setFormError(error.message),
  });

  if (confirmed) return <Confirmation order={confirmed} />;
  if (cartPending || profile.isPending) return <PageLoader />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  if (cart.items.length === 0 && !createOrder.isPending) return <Navigate to="/carrito" replace />;
  if (cart.items.some((i) => cartItemProblem(i))) return <Navigate to="/carrito" replace />;

  const goTo = (next: number) => {
    setFormError(null);
    setStep(next);
  };

  return (
    <div className="shell py-8 lg:py-12">
      <div className="mx-auto mb-10 max-w-2xl">
        <CheckoutSteps current={step} onStep={(i) => i < step && goTo(i)} />
      </div>

      <MobileSummary items={cart.items} total={cart.total} count={cart.count} />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="animate-fade-in" key={step}>
          {step === 1 && <ContactStep value={contact} onChange={setContact} onNext={() => goTo(2)} />}
          {step === 2 && <PaymentStep method={method} onMethod={setMethod} card={card} onCard={setCard} onBack={() => goTo(1)} onNext={() => goTo(3)} />}
          {step === 3 && (
            <ReviewStep
              contact={contact}
              method={method}
              items={cart.items}
              total={cart.total}
              error={formError}
              pending={createOrder.isPending}
              onEdit={goTo}
              onConfirm={() => {
                setFormError(null);
                createOrder.mutate();
              }}
            />
          )}
        </div>

        <aside className="hidden rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200/70 lg:sticky lg:top-40 lg:block">
          <h2 className="mb-4 flex items-center justify-between text-lg font-bold text-slate-900">
            Tu pedido
            <Link to="/carrito" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              Editar
            </Link>
          </h2>
          <SummaryItems items={cart.items} />
          <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{formatPrice(cart.total)}</span>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" /> Tus datos viajan de forma segura.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Resumen

function SummaryItems({ items }: { items: CartItem[] }) {
  return (
    <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="relative shrink-0">
            <img src={productImage(item.imagen)} onError={onImageError} alt="" className="h-14 w-14 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200" />
            <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-700 px-1 text-[11px] font-bold text-white">{item.cantidad}</span>
          </span>
          <p className="line-clamp-2 flex-1 text-sm font-medium text-slate-800">{item.nombre}</p>
          <span className="text-sm font-semibold text-slate-900">{formatPrice(item.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}

function MobileSummary({ items, total, count }: { items: CartItem[]; total: number; count: number }) {
  return (
    <details className="group mb-6 rounded-3xl bg-slate-50 ring-1 ring-slate-200/70 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-700">
          Ver resumen ({formatNumber(count)}) <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </span>
        <span className="text-lg font-extrabold text-slate-900">{formatPrice(total)}</span>
      </summary>
      <div className="border-t border-slate-200 px-5 py-4">
        <SummaryItems items={items} />
      </div>
    </details>
  );
}

// ------------------------------------------------------------------ Pasos

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 mb-7 text-slate-600">{subtitle}</p>
      {children}
    </section>
  );
}

function Field({ id, label, hint, error, icon, children }: { id: string; label: string; hint?: string; error?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">{icon}</span>
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-cherry-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

const fieldInput = (hasError: boolean) =>
  `h-12 w-full rounded-2xl border bg-white pr-4 pl-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError ? 'border-cherry-500 focus:ring-cherry-500/15' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/15'
  }`;

function ContactStep({ value, onChange, onNext }: { value: Contact; onChange: (c: Contact) => void; onNext: () => void }) {
  const [errors, setErrors] = useState<Partial<Record<keyof Contact, string>>>({});
  const set = (key: keyof Contact) => (e: { target: { value: string } }) => {
    onChange({ ...value, [key]: e.target.value });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!value.nombre.trim()) next.nombre = 'Escribe tu nombre.';
    if (!isEmail(value.correo.trim())) next.correo = 'Revisa el formato del correo.';
    if (value.telefono.length > 20) next.telefono = 'Máximo 20 caracteres.';
    setErrors(next);
    const firstError = Object.keys(next)[0];
    if (firstError) document.getElementById(firstError)?.focus();
    else onNext();
  };

  return (
    <StepCard title="Tus datos" subtitle="Los usamos para confirmar tu pedido y contactarte si es necesario.">
      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="nombre" label="Nombre completo" error={errors.nombre} icon={<User className="h-5 w-5" />}>
            <input id="nombre" className={fieldInput(!!errors.nombre)} value={value.nombre} onChange={set('nombre')} autoComplete="name" maxLength={100} aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? 'nombre-error' : undefined} />
          </Field>
          <Field id="correo" label="Correo electrónico" hint="Te enviaremos aquí la confirmación." error={errors.correo} icon={<Mail className="h-5 w-5" />}>
            <input id="correo" type="email" className={fieldInput(!!errors.correo)} value={value.correo} onChange={set('correo')} autoComplete="email" aria-invalid={!!errors.correo} aria-describedby={errors.correo ? 'correo-error' : undefined} />
          </Field>
        </div>
        <Field id="telefono" label="Teléfono (opcional)" hint="Para coordinar la entrega." error={errors.telefono} icon={<Phone className="h-5 w-5" />}>
          <input id="telefono" type="tel" className={fieldInput(!!errors.telefono)} placeholder="+56 9 1234 5678" value={value.telefono} onChange={set('telefono')} autoComplete="tel" maxLength={20} />
        </Field>
        <Field id="direccion" label="Dirección de envío (opcional)" icon={<MapPin className="h-5 w-5" />}>
          <input id="direccion" className={fieldInput(false)} placeholder="Calle, número, depto. y comuna" value={value.direccion} onChange={set('direccion')} autoComplete="street-address" maxLength={255} />
        </Field>
        <StepActions back={{ to: '/carrito', label: 'Volver al carrito' }} next="Continuar al pago" />
      </form>
    </StepCard>
  );
}

function PaymentStep({
  method,
  onMethod,
  card,
  onCard,
  onBack,
  onNext,
}: {
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
  card: { numero: string; vencimiento: string; cvv: string };
  onCard: (c: { numero: string; vencimiento: string; cvv: string }) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { data: settings } = useStoreSettings();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (method === 'tarjeta') {
      if (card.numero.replace(/\s/g, '').length < 13) return setError('El número de tarjeta no es válido.');
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.vencimiento)) return setError('El vencimiento debe tener el formato MM/AA.');
      if (card.cvv.length < 3) return setError('El código de seguridad no es válido.');
    }
    onNext();
  };

  return (
    <StepCard title="¿Cómo quieres pagar?" subtitle="Elige el medio de pago que más te acomode.">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-3" role="radiogroup" aria-label="Método de pago">
          {METHODS.map(({ id, title, text, icon: Icon }) => {
            const active = method === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  onMethod(id);
                  setError(null);
                }}
                className={`flex items-center gap-4 rounded-3xl p-4 text-left ring-2 transition sm:p-5 ${
                  active ? 'bg-brand-50 ring-brand-600' : 'bg-white ring-slate-200 hover:ring-slate-300'
                }`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-slate-900">{title}</span>
                  <span className="text-sm text-slate-500">{text}</span>
                </span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'}`}>
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        {method === 'tarjeta' && (
          <div className="animate-fade-in space-y-4 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200/70">
            <p className="flex gap-2 rounded-2xl bg-sun-100 p-3 text-sm text-brand-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Pago con tarjeta en modo de prueba: no se realiza ningún cargo real ni se guardan los datos de la tarjeta.
            </p>
            <Field id="card-number" label="Número de tarjeta" icon={<CreditCard className="h-5 w-5" />}>
              <input id="card-number" className={fieldInput(false)} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.numero} onChange={(e) => onCard({ ...card, numero: formatCardNumber(e.target.value) })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="card-exp" label="Vencimiento" icon={<CreditCard className="h-5 w-5" />}>
                <input id="card-exp" className={fieldInput(false)} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={card.vencimiento} onChange={(e) => onCard({ ...card, vencimiento: formatExpiry(e.target.value) })} />
              </Field>
              <Field id="card-cvv" label="Código (CVV)" icon={<Lock className="h-5 w-5" />}>
                <input id="card-cvv" className={fieldInput(false)} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvv} onChange={(e) => onCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
              </Field>
            </div>
          </div>
        )}
        {method === 'transferencia' && (
          <div className="animate-fade-in rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 ring-1 ring-slate-200/70">
            {settings?.datosTransferencia ? (
              <>
                <p className="mb-2 font-bold text-slate-900">Datos para la transferencia</p>
                <p className="whitespace-pre-line">{settings.datosTransferencia}</p>
                <p className="mt-3 text-xs text-slate-500">También te los enviamos en el correo de confirmación. Tu pedido queda pendiente hasta que confirmemos el pago.</p>
              </>
            ) : (
              <p>Te enviaremos los datos para transferir en el correo de confirmación. Tu pedido queda pendiente hasta que confirmemos el pago.</p>
            )}
          </div>
        )}
        {method === 'efectivo' && (
          <p className="animate-fade-in rounded-3xl bg-slate-50 p-5 text-sm text-slate-700 ring-1 ring-slate-200/70">Pagas en efectivo al momento de recibir tu pedido.</p>
        )}

        <FormError message={error} />
        <StepActions back={{ onClick: onBack, label: 'Volver' }} next="Revisar pedido" />
      </form>
    </StepCard>
  );
}

function ReviewStep({
  contact,
  method,
  items,
  total,
  error,
  pending,
  onEdit,
  onConfirm,
}: {
  contact: Contact;
  method: PaymentMethod;
  items: CartItem[];
  total: number;
  error: string | null;
  pending: boolean;
  onEdit: (step: number) => void;
  onConfirm: () => void;
}) {
  return (
    <StepCard title="Revisa y confirma" subtitle="Comprueba que todo esté correcto antes de confirmar tu pedido.">
      <div className="space-y-4">
        <ReviewBlock title="Tus datos" onEdit={() => onEdit(1)}>
          <p className="font-semibold text-slate-900">{contact.nombre}</p>
          <p>{contact.correo}</p>
          {contact.telefono && <p>{contact.telefono}</p>}
          <p className={contact.direccion ? '' : 'text-slate-400'}>{contact.direccion || 'Sin dirección de envío'}</p>
        </ReviewBlock>
        <ReviewBlock title="Pago" onEdit={() => onEdit(2)}>
          <p className="font-semibold text-slate-900">{PAYMENT_METHOD[method]}</p>
        </ReviewBlock>
        <ReviewBlock title={`Productos (${items.reduce((n, i) => n + i.cantidad, 0)})`} editTo="/carrito">
          <SummaryItems items={items} />
        </ReviewBlock>
      </div>

      <div className="mt-6 flex items-baseline justify-between rounded-3xl bg-brand-950 px-6 py-5 text-white">
        <span className="font-semibold text-white/80">Total a pagar</span>
        <span className="text-3xl font-extrabold tracking-tight">{formatPrice(total)}</span>
      </div>

      <div className="mt-6 space-y-4">
        <FormError message={error} />
        <button type="button" onClick={onConfirm} disabled={pending} className="btn-sun h-14 w-full text-base">
          {pending ? <Spinner /> : <Lock className="h-5 w-5" />}
          Confirmar pedido
        </button>
        <button type="button" onClick={() => onEdit(2)} className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
      </div>
    </StepCard>
  );
}

function ReviewBlock({ title, onEdit, editTo, children }: { title: string; onEdit?: () => void; editTo?: string; children: ReactNode }) {
  const edit = (
    <>
      <Pencil className="h-3.5 w-3.5" /> Editar
    </>
  );
  const editClass = 'flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900';
  return (
    <div className="rounded-3xl p-5 ring-1 ring-slate-200/70">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-slate-500 uppercase">{title}</h2>
        {editTo ? (
          <Link to={editTo} className={editClass}>
            {edit}
          </Link>
        ) : (
          <button type="button" onClick={onEdit} className={editClass}>
            {edit}
          </button>
        )}
      </div>
      <div className="space-y-0.5 text-sm text-slate-600">{children}</div>
    </div>
  );
}

function StepActions({ back, next }: { back: { to?: string; onClick?: () => void; label: string }; next: string }) {
  const backClass = 'flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900';
  return (
    <div className="flex flex-col-reverse items-center gap-4 pt-2 sm:flex-row sm:justify-between">
      {back.to ? (
        <Link to={back.to} className={backClass}>
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </Link>
      ) : (
        <button type="button" onClick={back.onClick} className={backClass}>
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </button>
      )}
      <button type="submit" className="btn-brand h-14 w-full px-8 text-base sm:w-auto">
        {next} <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}

// ------------------------------------------------------------------ Confirmación

function Confirmation({ order }: { order: Confirmed }) {
  const { data: settings } = useStoreSettings();
  useDocumentTitle(`Pedido #${order.id} confirmado`);

  const next: Record<PaymentMethod, string> = {
    transferencia: 'Haz la transferencia y confirmaremos tu pago. Mientras tanto, tu pedido queda como pendiente.',
    tarjeta: 'Registramos tu pago. Puedes seguir el avance de tu pedido en “Mis pedidos”.',
    efectivo: 'Pagas en efectivo al recibir tu pedido.',
  };

  return (
    <div className="shell py-12 lg:py-20">
      <div className="mx-auto max-w-2xl animate-fade-in text-center">
        <span className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 [animation-iteration-count:2]" />
          <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
            <Check className="h-12 w-12" strokeWidth={3} />
          </span>
        </span>
        <p className="eyebrow mb-3">Pedido #{order.id}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">¡Gracias, {order.nombre.split(' ')[0]}!</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600">
          Recibimos tu pedido de {formatNumber(order.count)} producto{order.count === 1 ? '' : 's'} por <strong className="text-slate-900">{formatPrice(order.total)}</strong>. Te
          enviamos el detalle por correo.
        </p>

        <div className="mt-10 rounded-[2rem] bg-slate-50 p-6 text-left ring-1 ring-slate-200/70 sm:p-8">
          <h2 className="mb-2 font-bold text-slate-900">¿Qué sigue?</h2>
          <p className="text-slate-600">{next[order.metodo]}</p>
          {order.metodo === 'transferencia' && settings?.datosTransferencia && (
            <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <p className="mb-2 text-sm font-bold text-slate-900">Datos para la transferencia</p>
              <p className="text-sm whitespace-pre-line text-slate-700">{settings.datosTransferencia}</p>
              <p className="mt-3 text-xs text-slate-500">
                Indica el número de pedido <strong>#{order.id}</strong> en el comentario de la transferencia.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/mis-pedidos/${order.id}`} className="btn-brand h-14 px-8 text-base">
            Ver mi pedido
          </Link>
          <Link to="/catalogo" className="btn-outline h-14 px-8 text-base">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
