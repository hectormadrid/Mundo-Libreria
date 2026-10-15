import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import type { Product } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { Spinner } from '../ui';

export function ProductCard({
  product,
  onAdd,
  adding,
}: {
  product: Product;
  onAdd: (productId: number) => void;
  adding: boolean;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/producto/${product.id}`} className="block aspect-[4/5] overflow-hidden bg-white">
        <img
          src={productImage(product.imagen)}
          onError={onImageError}
          alt={product.nombre}
          loading="lazy"
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col border-t border-gray-100 p-4">
        <h3 className="line-clamp-1 font-bold text-gray-900">
          <Link to={`/producto/${product.id}`} className="hover:text-lib-blue">
            {product.nombre}
          </Link>
        </h3>
        {product.descripcion && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.descripcion}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-lg font-bold text-lib-blue">{formatPrice(product.precio)}</p>
            <p className={`text-xs ${product.stock < 5 ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
              {product.stock < 5 ? `¡Últimas ${product.stock} unidades!` : `${product.stock} disponibles`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            disabled={adding}
            className="flex items-center gap-1 rounded-lg bg-lib-yellow px-3 py-2 text-sm font-medium text-lib-blue shadow-sm transition hover:bg-yellow-400 hover:shadow-md disabled:opacity-60"
            aria-label={`Agregar ${product.nombre} al carrito`}
          >
            {adding ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton h-96 rounded-xl" aria-hidden="true" />
      ))}
    </>
  );
}
