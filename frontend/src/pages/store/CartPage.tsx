import { Link } from 'react-router';
import { ArrowLeft, ArrowRight, Lock, PackageCheck, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart, useClearCart } from '../../hooks/useCart';
import { useProductShelf } from '../../hooks/useCatalog';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatNumber, formatPrice } from '../../lib/format';
import { confirmAction, toastError } from '../../lib/alerts';
import { ErrorState, PageLoader } from '../../components/ui';
import { ProductRail } from '../../components/store/ProductCard';
import { CartLine, CheckoutSteps, PaymentMethods, cartItemProblem } from '../../components/store/CartParts';

export function CartPage() {
  const { cart, isPending, error, refetch } = useCart();
  const clear = useClearCart();
  useDocumentTitle('Tu carrito');

  if (isPending) return <PageLoader label="Cargando tu carrito..." />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (cart.items.length === 0) {
    return (
      <div className="shell py-16">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ShoppingBag className="h-11 w-11" />
          </span>
          <h1 className="section-title">Tu carrito está vacío</h1>
          <p className="mt-3 text-slate-600">Recorre el catálogo y agrega lo que necesites. Aquí te esperamos.</p>
          <Link to="/catalogo" className="btn-brand mt-8 px-8">
            Explorar el catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Recommendations excludeIds={[]} title="Lo más vendido" />
      </div>
    );
  }

  const blocked = cart.items.some((i) => cartItemProblem(i));

  const handleClear = async () => {
    if (await confirmAction('Vaciar carrito', '¿Quieres quitar todos los productos del carrito?', 'Sí, vaciar')) {
      clear.mutate(undefined, { onError: toastError });
    }
  };

  return (
    <div className="shell py-8 lg:py-12">
      <div className="mx-auto mb-10 max-w-2xl">
        <CheckoutSteps current={0} />
      </div>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Tu carrito</h1>
          <p className="mt-1 text-slate-600">
            {formatNumber(cart.count)} {cart.count === 1 ? 'producto listo' : 'productos listos'} para comprar
          </p>
        </div>
        <button type="button" onClick={() => void handleClear()} disabled={clear.isPending} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cherry-600">
          <Trash2 className="h-4 w-4" /> Vaciar carrito
        </button>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_24rem]">
        <div>
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <CartLine key={item.id} item={item} />
            ))}
          </ul>
          <Link to="/catalogo" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Seguir comprando
          </Link>
        </div>

        <aside className="rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200/70 lg:sticky lg:top-40">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Resumen</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">
                Productos ({formatNumber(cart.count)})
              </dt>
              <dd className="font-semibold text-slate-900">{formatPrice(cart.total)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-4">
              <dt className="font-bold text-slate-900">Total</dt>
              <dd className="text-3xl font-extrabold tracking-tight text-slate-900">{formatPrice(cart.total)}</dd>
            </div>
          </dl>

          {blocked && <p className="mt-4 rounded-2xl bg-cherry-50 px-4 py-3 text-sm text-cherry-600">Ajusta los productos marcados en rojo para continuar.</p>}
          {blocked ? (
            <button type="button" disabled className="btn-brand mt-5 h-14 w-full text-base">
              <Lock className="h-5 w-5" /> Continuar con la compra
            </button>
          ) : (
            <Link to="/checkout" className="btn-brand mt-5 h-14 w-full text-base">
              <Lock className="h-5 w-5" /> Continuar con la compra
            </Link>
          )}

          <ul className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" /> Recibes la confirmación por correo.
            </li>
            <li className="flex items-center gap-3">
              <PackageCheck className="h-5 w-5 shrink-0 text-brand-600" /> Sigue tu pedido desde “Mis pedidos”.
            </li>
          </ul>
          <div className="mt-5">
            <PaymentMethods />
          </div>
        </aside>
      </div>

      <Recommendations excludeIds={cart.items.map((i) => i.id)} title="Agrega algo más" />
    </div>
  );
}

function Recommendations({ excludeIds, title }: { excludeIds: number[]; title: string }) {
  const shelf = useProductShelf('populares', 12);
  const { add, pendingId } = useAddToCartAction();
  const items = (shelf.data?.items ?? []).filter((p) => !excludeIds.includes(p.id)).slice(0, 8);
  if (shelf.isSuccess && items.length === 0) return null;

  return (
    <section className="pt-20">
      <p className="eyebrow mb-2">Lo que más se llevan</p>
      <h2 className="section-title mb-8">{title}</h2>
      <ProductRail products={items} loading={shelf.isPending} onAdd={(id) => add(id)} pendingId={pendingId} label="Recomendados" />
    </section>
  );
}
