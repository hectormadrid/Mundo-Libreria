import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import { api } from '../../lib/api';
import type { Family, ProductPage } from '../../lib/types';
import { Carousel } from '../../components/store/Carousel';
import { ProductCard, ProductGridSkeleton } from '../../components/store/ProductCard';
import { EmptyState, ErrorState, Spinner } from '../../components/ui';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';

export function HomePage() {
  const [params] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const familia = params.get('familia') ?? '';
  const q = params.get('q') ?? '';
  const productsRef = useRef<HTMLDivElement>(null);
  const { add, pendingId } = useAddToCartAction();

  const families = useQuery({
    queryKey: ['families', categoria],
    queryFn: () => api<Family[]>(`/families?categoria=${encodeURIComponent(categoria)}`),
    enabled: categoria !== '',
  });

  const products = useInfiniteQuery({
    queryKey: ['products', { categoria, familia, q }],
    queryFn: ({ pageParam }) => {
      const search = new URLSearchParams({ page: String(pageParam) });
      if (categoria) search.set('categoria', categoria);
      if (familia) search.set('familia', familia);
      if (q) search.set('q', q);
      return api<ProductPage>(`/products?${search}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });

  const items = products.data?.pages.flatMap((p) => p.items) ?? [];
  const total = products.data?.pages[0]?.total ?? 0;
  const familyLink = (id?: number) => {
    const next = new URLSearchParams({ categoria });
    if (id) next.set('familia', String(id));
    return `/?${next}`;
  };

  return (
    <>
      {!q && !categoria && <Carousel onCta={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })} />}

      {categoria && families.data && families.data.length > 0 && (
        <div className="border-b border-gray-200 bg-white/70 py-3 backdrop-blur">
          <div className="container mx-auto flex flex-wrap justify-center gap-2 px-4 text-sm">
            {[{ id: 0, nombre: 'Todos' }, ...families.data].map((f) => {
              const active = f.id === 0 ? !familia : familia === String(f.id);
              return (
                <Link
                  key={f.id}
                  to={familyLink(f.id || undefined)}
                  className={`rounded-full px-4 py-1.5 font-semibold shadow-sm transition hover:scale-105 ${active ? 'bg-lib-yellow text-lib-blue' : 'bg-white text-gray-700'}`}
                >
                  {f.nombre}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <section ref={productsRef} className="container mx-auto scroll-mt-20 px-4 py-12">
        <div className="mb-10 text-center">
          <h2 className="gradient-text mb-2 text-3xl font-bold sm:text-4xl">
            {q ? `Resultados para “${q}”` : categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1) : 'Nuestros Productos'}
          </h2>
          <p className="text-gray-600">
            {products.isSuccess
              ? `${total} producto${total === 1 ? '' : 's'} disponible${total === 1 ? '' : 's'}`
              : 'Descubre una selección cuidadosamente elegida para ti'}
          </p>
        </div>

        {products.isError ? (
          <ErrorState error={products.error} onRetry={() => void products.refetch()} />
        ) : products.isSuccess && items.length === 0 ? (
          <EmptyState icon={<SearchX className="mx-auto h-16 w-16" />} title="No encontramos lo que buscas">
            <p className="mb-6 max-w-md text-gray-500">Prueba con otros términos o selecciona una categoría diferente.</p>
            <Link to="/" className="btn-primary rounded-full px-8">
              Ver todos los productos
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.isPending ? (
              <ProductGridSkeleton />
            ) : (
              items.map((product, i) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${(i % 12) * 40}ms` }}>
                  <ProductCard product={product} onAdd={add} adding={pendingId === product.id} />
                </div>
              ))
            )}
          </div>
        )}

        {products.hasNextPage && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => void products.fetchNextPage()}
              disabled={products.isFetchingNextPage}
              className="btn-primary rounded-full px-8"
            >
              {products.isFetchingNextPage && <Spinner className="h-4 w-4" />}
              Cargar más productos
            </button>
          </div>
        )}
      </section>
    </>
  );
}
