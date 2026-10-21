import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Landmark, MapPin, PackageX, Phone, RotateCcw } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { OrderDetail } from '../../lib/types';
import { formatDate, formatNumber, formatPrice, PAYMENT_METHOD } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { toastError } from '../../lib/alerts';
import { useAddToCart } from '../../hooks/useCart';
import { useStoreSettings } from '../../hooks/useSettings';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { EmptyState, ErrorState, Spinner, StatusBadge } from '../../components/ui';
import { AccountShell } from '../../components/store/AccountShell';
import { OrderProgress } from '../../components/store/OrderProgress';
import { WhatsAppIcon } from '../../components/store/Footer';

export function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isPending, error, refetch } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => api<OrderDetail>(`/orders/${id}`),
  });
  useDocumentTitle(order ? `Pedido #${order.id}` : 'Mi pedido');

  return (
    <AccountShell>
      <Link to="/mis-pedidos" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900">
        <ArrowLeft className="h-4 w-4" /> Mis pedidos
      </Link>
      {isPending ? (
        <div className="space-y-4">
          <div className="skeleton h-40 rounded-[2rem]" />
          <div className="skeleton h-72 rounded-[2rem]" />
        </div>
      ) : error instanceof ApiError && error.status === 404 ? (
        <EmptyState icon={<PackageX className="mx-auto h-16 w-16" />} title="Pedido no encontrado">
          <Link to="/mis-pedidos" className="btn-brand mt-4 px-8">
            Ver mis pedidos
          </Link>
        </EmptyState>
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <OrderView order={order} />
      )}
    </AccountShell>
  );
}

function OrderView({ order }: { order: OrderDetail }) {
  const { data: settings } = useStoreSettings();
  const units = order.items.reduce((n, i) => n + i.cantidad, 0);
  const awaitingTransfer = order.estado === 'pendiente' && order.metodoPago === 'transferencia';

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Pedido #{order.id}</h2>
              <p className="text-slate-500">Realizado el {formatDate(order.fecha, true)}</p>
            </div>
            <StatusBadge status={order.estado} />
          </div>
          <OrderProgress estado={order.estado} seguimiento={order.seguimiento} />
        </section>

        {awaitingTransfer && (
          <section className="rounded-[2rem] bg-sun-100 p-6 ring-1 ring-sun-400/50 sm:p-8">
            <h2 className="flex items-center gap-2 font-bold text-brand-950">
              <Landmark className="h-5 w-5" /> Esperando tu transferencia
            </h2>
            <p className="mt-1 text-sm text-brand-950/80">Cuando confirmemos el pago, tu pedido pasará a “Pagado”.</p>
            {settings?.datosTransferencia && (
              <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm whitespace-pre-line text-slate-800">{settings.datosTransferencia}</p>
            )}
          </section>
        )}

        <section className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Productos <span className="font-normal text-slate-500">({formatNumber(units)})</span>
            </h2>
            <BuyAgain order={order} />
          </div>
          <ul className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <Link to={`/producto/${item.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-50">
                  <img src={productImage(item.imagen)} onError={onImageError} alt="" className="h-full w-full object-contain p-2 mix-blend-multiply" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/producto/${item.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-700">
                    {item.nombre}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {item.cantidad} × {formatPrice(item.precio)}
                  </p>
                </div>
                <span className="font-bold text-slate-900">{formatPrice(item.subtotal)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-40">
        <section className="rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200/70">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Resumen</h2>
          <dl className="space-y-3 text-sm">
            <Info icon={<CreditCard className="h-4 w-4" />} label="Pago" value={order.metodoPago ? PAYMENT_METHOD[order.metodoPago] : 'No indicado'} />
            <Info icon={<MapPin className="h-4 w-4" />} label="Envío" value={order.direccionEnvio || 'Sin dirección'} />
            <Info icon={<Phone className="h-4 w-4" />} label="Teléfono" value={order.telefonoContacto || 'No indicado'} />
          </dl>
          <div className="mt-5 flex items-baseline justify-between border-t border-slate-200 pt-4">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{formatPrice(order.total)}</span>
          </div>
        </section>

        {settings?.whatsapp && (
          <a
            href={whatsappLink(settings.whatsapp, order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-[2rem] bg-emerald-50 p-5 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <WhatsAppIcon />
            </span>
            <span className="text-sm">
              <strong className="block text-slate-900">¿Dudas con tu pedido?</strong>
              <span className="text-slate-600">Escríbenos por WhatsApp.</span>
            </span>
          </a>
        )}
      </aside>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="font-semibold break-words text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

/** Enlace de WhatsApp con el número de pedido ya escrito (solo para enlaces wa.me). */
function whatsappLink(base: string, orderId: number) {
  try {
    const url = new URL(base);
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') url.searchParams.set('text', `Hola, tengo una consulta sobre mi pedido #${orderId}`);
    return url.toString();
  } catch {
    return base;
  }
}

/** Vuelve a agregar al carrito los productos del pedido que sigan disponibles. */
function BuyAgain({ order }: { order: OrderDetail }) {
  const addToCart = useAddToCart();
  const { openDrawer } = useCartDrawer();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    let failed = 0;
    for (const item of order.items) {
      try {
        await addToCart.mutateAsync({ productId: item.id, cantidad: item.cantidad });
      } catch {
        failed++;
      }
    }
    setBusy(false);
    if (failed === order.items.length) return toastError('Estos productos ya no están disponibles.');
    if (failed > 0) toastError(`${failed} producto${failed === 1 ? '' : 's'} ya no ${failed === 1 ? 'está disponible' : 'están disponibles'} en esa cantidad.`);
    openDrawer();
  };

  return (
    <button type="button" onClick={() => void run()} disabled={busy} className="btn-outline py-2.5">
      {busy ? <Spinner className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />} Comprar de nuevo
    </button>
  );
}
