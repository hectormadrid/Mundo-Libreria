import { useEffect } from 'react';
import { Link } from 'react-router';
import { ShoppingBag, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart, useRemoveCartItem } from '../../hooks/useCart';
import { useSession } from '../../hooks/useSession';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { toastError } from '../../lib/alerts';

export function CartDrawer() {
  const { open, closeDrawer } = useCartDrawer();
  const { data: session } = useSession();
  const { cart } = useCart();
  const remove = useRemoveCartItem();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeDrawer]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeDrawer}
      />
      <aside
        role="dialog"
        aria-label="Tu carrito"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between bg-gradient-to-r from-lib-blue to-blue-600 p-5 text-white">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <ShoppingCart className="h-6 w-6" /> Tu Carrito
          </h3>
          <button type="button" onClick={closeDrawer} className="rounded-full p-1 hover:bg-white/20" aria-label="Cerrar carrito">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {!session?.user ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-gray-500">
              <ShoppingBag className="h-16 w-16 text-gray-300" />
              <p>Inicia sesión para ver tu carrito.</p>
              <Link to="/login" onClick={closeDrawer} className="btn-primary">
                Iniciar sesión
              </Link>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-500">
              <ShoppingBag className="h-16 w-16 text-gray-300" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <img
                  src={productImage(item.imagen)}
                  onError={onImageError}
                  alt=""
                  className="h-16 w-16 rounded-lg bg-white object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-1 text-sm font-bold text-gray-800">{item.nombre}</h4>
                  <p className="text-sm text-gray-500">
                    {item.cantidad} × {formatPrice(item.precio)}
                  </p>
                  <p className="font-semibold text-lib-blue">{formatPrice(item.subtotal)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(item.id, { onError: toastError })}
                  disabled={remove.isPending}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-lib-red"
                  aria-label={`Quitar ${item.nombre}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {session?.user && cart.items.length > 0 && (
          <div className="space-y-3 border-t border-gray-100 p-5">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-gray-600">Subtotal</span>
              <span className="font-bold text-lib-blue">{formatPrice(cart.total)}</span>
            </div>
            <Link to="/carrito" onClick={closeDrawer} className="btn-ghost w-full">
              Ver carrito completo
            </Link>
            <Link to="/checkout" onClick={closeDrawer} className="btn-yellow w-full">
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
