import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CreditCard, Landmark, Lock, User } from 'lucide-react';
import { api } from '../../lib/api';
import type { PaymentMethod, Profile } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { alertSuccess } from '../../lib/alerts';
import { useCart } from '../../hooks/useCart';
import { useStoreSettings } from '../../hooks/useSettings';
import { ErrorState, FormError, PageLoader, Spinner } from '../../components/ui';

const METHODS: { id: PaymentMethod; title: string; text: string; icon: typeof CreditCard }[] = [
  { id: 'transferencia', title: 'Transferencia', text: 'Pago directo a cuenta bancaria', icon: Landmark },
  { id: 'tarjeta', title: 'Tarjeta', text: 'Crédito o débito', icon: CreditCard },
  { id: 'efectivo', title: 'Efectivo', text: 'Pago al recibir', icon: Banknote },
];

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, isPending: cartPending } = useCart();
  const { data: settings } = useStoreSettings();
  const profile = useQuery({ queryKey: ['profile'], queryFn: () => api<Profile>('/profile') });

  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', direccion: '' });
  const [method, setMethod] = useState<PaymentMethod>('transferencia');
  // Los datos de tarjeta nunca se envían al servidor: solo se validan en el navegador.
  const [card, setCard] = useState({ numero: '', vencimiento: '', cvv: '' });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.data) {
      setForm({
        nombre: profile.data.nombre,
        correo: profile.data.correo,
        telefono: profile.data.telefono ?? '',
        direccion: profile.data.direccion ?? '',
      });
    }
  }, [profile.data]);

  const createOrder = useMutation({
    mutationFn: () => api<{ id: number }>('/orders', { method: 'POST', body: { ...form, metodoPago: method } }),
    onSuccess: async ({ id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cart'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      await alertSuccess('¡Pedido confirmado!', `Tu pedido #${id} fue registrado. Te enviamos un correo con el detalle.`, 'Ver mi pedido');
      navigate(`/mis-pedidos/${id}`, { replace: true });
    },
    onError: (error) => setFormError(error.message),
  });

  if (cartPending || profile.isPending) return <PageLoader />;
  if (profile.error) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;
  if (cart.items.length === 0 && !createOrder.isPending && !createOrder.isSuccess) return <Navigate to="/carrito" replace />;

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (method === 'tarjeta') {
      if (card.numero.replace(/\s/g, '').length < 13) return setFormError('El número de tarjeta no es válido.');
      if (!/^\d{2}\/\d{2}$/.test(card.vencimiento)) return setFormError('El vencimiento debe tener el formato MM/AA.');
      if (card.cvv.length < 3) return setFormError('El CVV no es válido.');
    }
    createOrder.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Finalizar compra</h1>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-800">
              <User className="h-5 w-5 text-lib-blue" /> Información de contacto
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="label">Nombre completo *</label>
                <input id="nombre" className="input" required value={form.nombre} onChange={set('nombre')} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="correo" className="label">Correo electrónico *</label>
                <input id="correo" type="email" className="input" required value={form.correo} onChange={set('correo')} autoComplete="email" />
              </div>
              <div>
                <label htmlFor="telefono" className="label">Teléfono</label>
                <input id="telefono" type="tel" className="input" placeholder="+56 9 1234 5678" value={form.telefono} onChange={set('telefono')} autoComplete="tel" />
              </div>
              <div>
                <label htmlFor="direccion" className="label">Dirección de envío</label>
                <input id="direccion" className="input" placeholder="Av. Principal #123" value={form.direccion} onChange={set('direccion')} autoComplete="street-address" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-800">
              <CreditCard className="h-5 w-5 text-lib-blue" /> Método de pago
            </h2>
            <div className="grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Método de pago">
              {METHODS.map(({ id, title, text, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => setMethod(id)}
                  className={`rounded-xl border-2 p-4 text-center transition ${method === id ? 'border-lib-blue bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Icon className={`mx-auto mb-2 h-8 w-8 ${method === id ? 'text-lib-blue' : 'text-gray-400'}`} />
                  <p className="font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500">{text}</p>
                </button>
              ))}
            </div>

            {method === 'tarjeta' && (
              <div className="mt-6 animate-fade-in rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                  Pago con tarjeta en modo de prueba: no se realiza ningún cargo real ni se guardan los datos de la tarjeta.
                </p>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="card-number" className="label">Número de tarjeta</label>
                    <input
                      id="card-number"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={card.numero}
                      onChange={(e) => setCard({ ...card, numero: formatCardNumber(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-exp" className="label">Vencimiento</label>
                    <input
                      id="card-exp"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      value={card.vencimiento}
                      onChange={(e) => setCard({ ...card, vencimiento: formatExpiry(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvv" className="label">CVV</label>
                    <input
                      id="card-cvv"
                      className="input"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    />
                  </div>
                </div>
              </div>
            )}
            {method === 'transferencia' && (
              <div className="mt-4 space-y-3">
                {settings?.datosTransferencia && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="mb-1 font-semibold">Datos para la transferencia</p>
                    <p className="whitespace-pre-line">{settings.datosTransferencia}</p>
                    <p className="mt-2 text-xs">También te los enviaremos en el correo de confirmación.</p>
                  </div>
                )}
                <p className="text-sm text-gray-600">Tu pedido quedará pendiente hasta que confirmemos la transferencia.</p>
              </div>
            )}
            {method === 'efectivo' && <p className="mt-4 text-sm text-gray-600">Pagas al momento de recibir tu pedido.</p>}
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Tu pedido</h2>
          <ul className="mb-4 max-h-72 space-y-3 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <img src={productImage(item.imagen)} onError={onImageError} alt="" className="h-12 w-12 rounded-lg border object-contain p-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.nombre}</p>
                  <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-gray-100 py-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-lib-blue">{formatPrice(cart.total)}</span>
          </div>
          <FormError message={formError} />
          <button type="submit" disabled={createOrder.isPending} className="btn-yellow mt-4 w-full py-3 text-lg">
            {createOrder.isPending ? <Spinner /> : <Lock className="h-5 w-5" />}
            Confirmar pedido
          </button>
          <Link to="/carrito" className="mt-4 block text-center text-sm text-lib-blue hover:underline">
            Volver al carrito
          </Link>
        </aside>
      </form>
    </div>
  );
}
