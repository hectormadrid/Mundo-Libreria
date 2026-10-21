import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Lock, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSession } from '../../hooks/useSession';
import { useProductShelf } from '../../hooks/useCatalog';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { Spinner } from '../ui';
import { CartLine, cartItemProblem } from './CartParts';

export function CartDrawer() {
  const { open, closeDrawer, lastAdded } = useCartDrawer();
  const { data: session } = useSession();
  const { cart } = useCart();
  const panel = useRef<HTMLElement>(null);
  const blocked = cart.items.some((i) => cartItemProblem(i));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, closeDrawer]);

  // El producto recién agregado se muestra primero.
  const items = lastAdded ? [...cart.items].sort((a, b) => Number(b.id === lastAdded) - Number(a.id === lastAdded)) : cart.items;

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open}>
      <div className={`absolute inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl outline-none transition-transform duration-300 ease-out sm:rounded-l-[2rem] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="flex items-center gap-3 font-display text-2xl font-semibold text-slate-900">
            Tu carrito
            {cart.count > 0 && <span className="rounded-full bg-brand-600 px-2.5 py-0.5 font-sans text-sm font-bold text-white">{cart.count}</span>}
          </h2>
          <button type="button" onClick={closeDrawer} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Cerrar carrito">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!session?.user ? (
          <Empty title="Inicia sesión para comprar" text="Así guardamos tu carrito y puedes seguir tus pedidos.">
            <Link to="/login" onClick={closeDrawer} className="btn-brand w-full">
              Iniciar sesión
            </Link>
            <Link to="/registro" onClick={closeDrawer} className="btn-outline w-full">
              Crear una cuenta
            </Link>
          </Empty>
        ) : cart.items.length === 0 ? (
          <Empty title="Tu carrito está vacío" text="Agrega productos y aparecerán aquí.">
            <Link to="/catalogo" onClick={closeDrawer} className="btn-brand w-full">
              Explorar el catálogo <ArrowRight className="h-4 w-4" />
            </Link>
            <Suggestions />
          </Empty>
        ) : (
          <>
            <ul className="flex-1 space-y-2 overflow-y-auto px-4 pt-3 pb-4">
              {items.map((item) => (
                <CartLine key={item.id} item={item} compact highlight={item.id === lastAdded} onNavigate={closeDrawer} />
              ))}
            </ul>

            <div className="space-y-3 border-t border-slate-100 bg-slate-50/80 px-6 pt-5 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-2xl font-extrabold text-slate-900">{formatPrice(cart.total)}</span>
              </div>
              {blocked && <p className="rounded-2xl bg-cherry-50 px-4 py-2.5 text-sm text-cherry-600">Ajusta los productos marcados para continuar.</p>}
              {blocked ? (
                <button type="button" disabled className="btn-brand h-14 w-full text-base">
                  <Lock className="h-5 w-5" /> Ir a pagar
                </button>
              ) : (
                <Link to="/checkout" onClick={closeDrawer} className="btn-brand h-14 w-full text-base">
                  <Lock className="h-5 w-5" /> Ir a pagar
                </Link>
              )}
              <div className="flex items-center justify-between gap-3 text-sm">
                <button type="button" onClick={closeDrawer} className="font-semibold text-slate-500 hover:text-slate-900">
                  Seguir comprando
                </button>
                <Link to="/carrito" onClick={closeDrawer} className="font-bold text-brand-700 hover:text-brand-900">
                  Ver carrito completo
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Empty({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6">
      <div className="flex flex-col items-center py-10 text-center">
        <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <p className="font-display text-2xl font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-slate-500">{text}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Algunos de los más vendidos para no dejar el carrito vacío sin ideas. */
function Suggestions() {
  const { data } = useProductShelf('populares', 8);
  const { add, pendingId } = useAddToCartAction();
  const { closeDrawer } = useCartDrawer();
  const items = data?.items.slice(0, 3) ?? [];
  if (items.length === 0) return null;

  return (
    <div className="pt-6">
      <p className="eyebrow mb-3">Lo más vendido</p>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-2xl p-2 ring-1 ring-slate-200/70">
            <Link to={`/producto/${p.id}`} onClick={closeDrawer} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
              <img src={productImage(p.imagen)} onError={onImageError} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/producto/${p.id}`} onClick={closeDrawer} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-700">
                {p.nombre}
              </Link>
              <p className="text-sm font-bold text-slate-900">{formatPrice(p.precio)}</p>
            </div>
            <button
              type="button"
              onClick={() => add(p.id)}
              disabled={pendingId === p.id}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
              aria-label={`Agregar ${p.nombre} al carrito`}
            >
              {pendingId === p.id ? <Spinner className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
