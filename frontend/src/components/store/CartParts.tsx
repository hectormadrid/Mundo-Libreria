import { Fragment } from 'react';
import { Link } from 'react-router';
import { AlertCircle, Banknote, Check, CreditCard, Landmark, Trash2 } from 'lucide-react';
import type { CartItem } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { toastError } from '../../lib/alerts';
import { useRemoveCartItem, useUpdateCartItem } from '../../hooks/useCart';
import { QuantityStepper, Spinner } from '../ui';

/** Problema de un producto del carrito que impide comprar, si lo hay. */
export function cartItemProblem(item: CartItem): string | null {
  if (!item.disponible) return 'Ya no está disponible';
  if (item.stock === 0) return 'Se agotó';
  if (item.cantidad > item.stock) return `Solo quedan ${item.stock} unidades`;
  return null;
}

/** Un producto del carrito, con cantidad editable y botón para quitarlo. */
export function CartLine({ item, compact = false, highlight = false, onNavigate }: { item: CartItem; compact?: boolean; highlight?: boolean; onNavigate?: () => void }) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const problem = cartItemProblem(item);
  const busy = (update.isPending && update.variables?.productId === item.id) || (remove.isPending && remove.variables === item.id);
  const image = compact ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28';

  return (
    <li
      className={`relative flex gap-4 rounded-3xl p-3 transition ${highlight ? 'bg-brand-50 ring-2 ring-brand-300' : compact ? '' : 'bg-white ring-1 ring-slate-200/70'} ${
        busy ? 'opacity-60' : ''
      }`}
    >
      {highlight && (
        <span className="absolute -top-2.5 left-4 flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
          <Check className="h-3 w-3" /> Agregado
        </span>
      )}
      <Link to={`/producto/${item.id}`} onClick={onNavigate} className={`shrink-0 overflow-hidden rounded-2xl bg-slate-50 ${image}`}>
        <img src={productImage(item.imagen)} onError={onImageError} alt={item.nombre} className="h-full w-full object-contain p-2 mix-blend-multiply" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/producto/${item.id}`}
            onClick={onNavigate}
            className={`line-clamp-2 font-semibold text-slate-900 hover:text-brand-700 ${compact ? 'text-sm' : 'sm:text-lg'}`}
          >
            {item.nombre}
          </Link>
          <button
            type="button"
            onClick={() => remove.mutate(item.id, { onError: toastError })}
            disabled={busy}
            className="-mt-1 -mr-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-cherry-50 hover:text-cherry-600"
            aria-label={`Quitar ${item.nombre} del carrito`}
            title="Quitar"
          >
            {remove.isPending && remove.variables === item.id ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-sm text-slate-500">{formatPrice(item.precio)} c/u</p>
        {problem && (
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-cherry-600">
            <AlertCircle className="h-4 w-4" /> {problem}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <QuantityStepper
            value={item.cantidad}
            max={Math.max(item.stock, 1)}
            disabled={busy || !item.disponible}
            onChange={(cantidad) => update.mutate({ productId: item.id, cantidad }, { onError: toastError })}
          />
          <p className={`font-extrabold text-slate-900 ${compact ? '' : 'text-lg'}`}>{formatPrice(item.subtotal)}</p>
        </div>
      </div>
    </li>
  );
}

const STEPS = ['Carrito', 'Tus datos', 'Pago', 'Confirmar'];

/** Indicador de avance de la compra; `current` empieza en 0 (Carrito). */
export function CheckoutSteps({ current, onStep }: { current: number; onStep?: (index: number) => void }) {
  return (
    <ol className="flex items-center" aria-label="Pasos de la compra">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        // El carrito es otra página; los pasos ya hechos del checkout se pueden revisar.
        const clickable = done && (i === 0 || onStep);
        const circle = (
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
              done ? 'bg-brand-600 text-white' : active ? 'bg-sun-400 text-brand-950 ring-4 ring-sun-400/30' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {done ? <Check className="h-4 w-4" /> : i + 1}
          </span>
        );
        const text = <span className={`hidden text-sm font-semibold sm:inline ${active ? 'text-slate-900' : done ? 'text-brand-700' : 'text-slate-400'}`}>{label}</span>;

        return (
          <Fragment key={label}>
            <li className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
              {clickable ? (
                i === 0 ? (
                  <Link to="/carrito" className="flex items-center gap-2 hover:opacity-80">
                    {circle}
                    {text}
                  </Link>
                ) : (
                  <button type="button" onClick={() => onStep?.(i)} className="flex items-center gap-2 hover:opacity-80">
                    {circle}
                    {text}
                  </button>
                )
              ) : (
                <>
                  {circle}
                  {text}
                </>
              )}
              <span className="sr-only">{done ? '(completado)' : active ? '(paso actual)' : ''}</span>
            </li>
            {i < STEPS.length - 1 && <li aria-hidden="true" className={`mx-2 h-0.5 flex-1 rounded-full sm:mx-4 ${i < current ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </Fragment>
        );
      })}
    </ol>
  );
}

export function PaymentMethods() {
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Medios de pago">
      {[
        { icon: Landmark, label: 'Transferencia' },
        { icon: CreditCard, label: 'Tarjeta' },
        { icon: Banknote, label: 'Efectivo' },
      ].map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          <Icon className="h-3.5 w-3.5" /> {label}
        </li>
      ))}
    </ul>
  );
}
