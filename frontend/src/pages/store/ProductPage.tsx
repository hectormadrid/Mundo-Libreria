import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, PackageX, ShoppingCart } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { ProductDetail } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { EmptyState, ErrorState, PageLoader, QuantityStepper, Spinner } from '../../components/ui';
import { ProductCard } from '../../components/store/ProductCard';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';

export function ProductPage() {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(1);
  const { add, pendingId } = useAddToCartAction();

  const { data: product, isPending, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api<ProductDetail>(`/products/${id}`),
  });

  if (isPending) return <PageLoader />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState icon={<PackageX className="mx-auto h-16 w-16" />} title="Producto no encontrado">
        <p className="mb-6 text-gray-500">Puede que ya no esté disponible.</p>
        <Link to="/" className="btn-primary">
          Volver a la tienda
        </Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const categoriaLink = product.categoria ? `/?categoria=${encodeURIComponent(product.categoria.toLowerCase())}` : '/';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-lib-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>

      <div className="card grid gap-10 p-6 md:grid-cols-2 md:p-10">
        <div className="flex items-center justify-center rounded-xl bg-white">
          <img
            src={productImage(product.imagen)}
            onError={onImageError}
            alt={product.nombre}
            className="max-h-[28rem] w-full object-contain"
          />
        </div>

        <div className="flex flex-col">
          <nav className="mb-2 text-sm text-gray-500" aria-label="Categoría">
            {product.categoria && (
              <Link to={categoriaLink} className="hover:text-lib-blue">
                {product.categoria}
              </Link>
            )}
            {product.familia && product.idFamilia && (
              <>
                {' / '}
                <Link to={`${categoriaLink}&familia=${product.idFamilia}`} className="hover:text-lib-blue">
                  {product.familia}
                </Link>
              </>
            )}
          </nav>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{product.nombre}</h1>
          <p className="mb-6 text-3xl font-bold text-lib-blue">{formatPrice(product.precio)}</p>

          {product.descripcion && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-800">Descripción</h2>
              <p className="whitespace-pre-line text-gray-600">{product.descripcion}</p>
            </div>
          )}

          <dl className="mb-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">Marca</dt>
              <dd className="font-semibold">{product.marca || 'N/A'}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">Color</dt>
              <dd className="font-semibold">{product.color || 'N/A'}</dd>
            </div>
            <div className="col-span-2 rounded-lg bg-gray-50 p-3">
              <dt className="text-gray-500">Disponibilidad</dt>
              <dd className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-lib-red'}`}>
                {product.stock > 0 ? `${product.stock} unidades en stock` : 'Agotado'}
              </dd>
            </div>
          </dl>

          {product.stock > 0 && (
            <div className="mt-auto flex flex-wrap items-center gap-4">
              <QuantityStepper value={cantidad} max={product.stock} onChange={setCantidad} />
              <button
                type="button"
                onClick={() => add(product.id, cantidad)}
                disabled={pendingId === product.id}
                className="btn-yellow flex-1 py-3 text-lg"
              >
                {pendingId === product.id ? <Spinner /> : <ShoppingCart className="h-5 w-5" />}
                Añadir al carrito
              </button>
            </div>
          )}
        </div>
      </div>

      {product.similares.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Productos similares</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.similares.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={add} adding={pendingId === p.id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
