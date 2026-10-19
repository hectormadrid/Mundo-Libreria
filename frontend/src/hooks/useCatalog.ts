import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category, ProductOrder, ProductPage } from '../lib/types';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/categories'), staleTime: 10 * 60 * 1000 });
}

/** Una tanda corta de productos para las vitrinas de la portada. */
export function useProductShelf(orden: ProductOrder, limite = 8) {
  return useQuery({
    queryKey: ['products', 'shelf', orden, limite],
    queryFn: () => api<ProductPage>(`/products?orden=${orden}&limite=${limite}`),
    staleTime: 5 * 60 * 1000,
  });
}

/** Ruta del catálogo con los filtros indicados. */
export function catalogUrl(filters: { categoria?: string; familia?: number | string; q?: string; orden?: ProductOrder } = {}) {
  const params = new URLSearchParams();
  if (filters.categoria) params.set('categoria', filters.categoria.toLowerCase());
  if (filters.familia) params.set('familia', String(filters.familia));
  if (filters.q) params.set('q', filters.q);
  if (filters.orden) params.set('orden', filters.orden);
  const query = params.toString();
  return query ? `/catalogo?${query}` : '/catalogo';
}
