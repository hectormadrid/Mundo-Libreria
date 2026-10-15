import { Link } from 'react-router';
import { AlertCircle, ArrowLeft, CreditCard, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { confirmAction, toastError } from '../../lib/alerts';
import { EmptyState, ErrorState, PageLoader, QuantityStepper } from '../../components/ui';

export function CartPage() {
  const { cart, isPending, error, refetch } = useCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const clear = useClearCart();

  if (isPending) return <PageLoader label="Cargando tu carrito..." />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  if (cart.items.length === 0) {
    return (
      <EmptyState icon={<ShoppingCart className="mx-auto h-20 w-20" />} title="¡Tu carrito está vacío!">
        <p className="mb-6 text-gray-500">Agrega productos para continuar con tu compra.</p>
        <Link to="/" className="btn-primary rounded-full px-8">
          Explorar productos
        </Link>
      </EmptyState>
    );
  }

  const unavailable = cart.items.some((i) => !i.disponible || i.cantidad > i.stock);

  const handleRemove = async (id: number, nombre: string) => {
    if (await confirmAction('¿Quitar producto?', `"${nombre}" será eliminado del carrito.`, 'Sí, quitar')) {
      remove.mutate(id, { onError: toastError });
    }
  };

  const handleClear = async () => {
    if (await confirmAction('Vaciar carrito', '¿Deseas eliminar todos los productos del carrito?', 'Sí, vaciar')) {
      clear.mutate(undefined, { onError: toastError });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-gray-800">
        <ShoppingCart className="h-8 w-8 text-lib-blue" /> Tu carrito
      </h1>
      <p className="mb-8 text-gray-600">Revisa tus productos antes de finalizar la compra</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => {
            const problem = !item.disponible ? 'Ya no está disponible' : item.cantidad > item.stock ? `Solo quedan ${item.stock} unidades` : null;
            return (
              <div key={item.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Link to={`/producto/${item.id}`} className="shrink-0">
                  <img
                    src={productImage(item.imagen)}
                    onError={onImageError}
                    alt={item.nombre}
                    className="h-24 w-24 rounded-xl border border-gray-200 object-contain p-1"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/producto/${item.id}`} className="text-lg font-bold text-gray-800 hover:text-lib-blue">
                    {item.nombre}
                  </Link>
                  <p className="text-gray-500">{formatPrice(item.precio)} c/u</p>
                  {problem && (
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-lib-red">
                      <AlertCircle className="h-4 w-4" /> {problem}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-2">
                  <QuantityStepper
                    value={item.cantidad}
                    max={Math.max(item.stock, 1)}
                    disabled={update.isPending || !item.disponible}
                    onChange={(cantidad) => update.mutate({ productId: item.id, cantidad }, { onError: toastError })}
                  />
                  <p className="text-xl font-bold text-lib-blue">{formatPrice(item.subtotal)}</p>
                  <button
                    type="button"
                    onClick={() => void handleRemove(item.id, item.nombre)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-lib-red"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Link to="/" className="btn-ghost">
              <ArrowLeft className="h-4 w-4" /> Seguir comprando
            </Link>
            <button type="button" onClick={() => void handleClear()} disabled={clear.isPending} className="btn-ghost text-lib-red">
              <Trash2 className="h-4 w-4" /> Vaciar carrito
            </button>
          </div>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Resumen de compra</h2>
          <div className="space-y-3 border-b border-gray-100 pb-4 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal ({cart.count} productos)</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
          </div>
          <div className="flex justify-between py-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-lib-blue">{formatPrice(cart.total)}</span>
          </div>
          {unavailable && (
            <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Ajusta los productos marcados para poder continuar.</p>
          )}
          {unavailable ? (
            <button type="button" disabled className="btn-yellow w-full py-3">
              <CreditCard className="h-5 w-5" /> Proceder al pago
            </button>
          ) : (
            <Link to="/checkout" className="btn-yellow w-full py-3">
              <CreditCard className="h-5 w-5" /> Proceder al pago
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
