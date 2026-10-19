import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import type { Product } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { Spinner } from '../ui';

/** Pocas unidades: se muestra el aviso de "últimas unidades". */
export const LOW_STOCK = 5;

export function ProductCard({
  product,
  onAdd,
  adding,
}: {
  product: Product;
  onAdd: (productId: number) => void;
  adding: boolean;
}) {
  const lowStock = product.stock > 0 && product.stock < LOW_STOCK;

  return (
    <article className="group relative flex h-full flex-col rounded-3xl bg-white p-3 ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-900/10 hover:ring-brand-200">
      {/* Toda la tarjeta es clicable gracias al enlace del nombre (after:inset-0). */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        <img
          src={productImage(product.imagen)}
          onError={onImageError}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.nuevo && <Badge className="bg-sun-400 text-brand-950">Nuevo</Badge>}
          {lowStock && <Badge className="bg-cherry-500 text-white">¡Últimas {product.stock}!</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        {product.categoria && <p className="mb-1 text-[11px] font-bold tracking-wider text-brand-600 uppercase">{product.categoria}</p>}
        <h3 className="line-clamp-2 min-h-[2.75rem] leading-snug font-semibold text-slate-900">
          <Link to={`/producto/${product.id}`} className="after:absolute after:inset-0 after:rounded-3xl hover:text-brand-700">
            {product.nombre}
          </Link>
        </h3>
        {product.marca && <p className="mt-0.5 text-sm text-slate-500">{product.marca}</p>}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <p className="text-xl font-extrabold tracking-tight text-slate-900">{formatPrice(product.precio)}</p>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            disabled={adding}
            className="relative z-10 flex h-11 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60"
            aria-label={`Agregar ${product.nombre} al carrito`}
          >
            {adding ? <Spinner className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${className}`}>{children}</span>;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-3xl bg-white p-3 ring-1 ring-slate-200/70" aria-hidden="true">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="skeleton mt-4 h-3 w-1/3 rounded-full" />
          <div className="skeleton mt-3 h-4 w-4/5 rounded-full" />
          <div className="mt-6 flex items-center justify-between">
            <div className="skeleton h-6 w-1/3 rounded-full" />
            <div className="skeleton h-11 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

/** Vitrina horizontal deslizable, con flechas en pantallas grandes. */
export function ProductRail({
  products,
  loading,
  onAdd,
  pendingId,
  label,
}: {
  products: Product[];
  loading: boolean;
  onAdd: (productId: number) => void;
  pendingId: number | undefined;
  label: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });

  const item = 'w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.5%]';

  return (
    <div className="relative">
      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pt-1 pb-6 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {loading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={item}>
                <ProductGridSkeleton count={1} />
              </div>
            ))
          : products.map((p) => (
              <div key={p.id} className={item}>
                <ProductCard product={p} onAdd={onAdd} adding={pendingId === p.id} />
              </div>
            ))}
      </div>
      {!loading && products.length > 4 && (
        <>
          <RailButton side="left" hidden={edges.start} onClick={() => scroll(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </RailButton>
          <RailButton side="right" hidden={edges.end} onClick={() => scroll(1)}>
            <ChevronRight className="h-5 w-5" />
          </RailButton>
        </>
      )}
    </div>
  );
}

function RailButton({ side, hidden, onClick, children }: { side: 'left' | 'right'; hidden: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-hidden="true"
      className={`absolute top-[40%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white lg:flex ${
        side === 'left' ? '-left-5' : '-right-5'
      } ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      {children}
    </button>
  );
}
