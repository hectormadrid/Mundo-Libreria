
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Product, ProductPage } from '../lib/types';

const KEY = 'ml:vistos';
const MAX = 12;

/** Ids de los productos vistos en este navegador, del más reciente al más antiguo. */
function readIds(): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n) && n > 0).slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function rememberViewed(id: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...readIds().filter((n) => n !== id)].slice(0, MAX)));
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): simplemente no se recuerda.
  }
}

/** Productos vistos recientemente (con precio y stock actuales), sin incluir `exclude`. */
export function useRecentlyViewed(exclude?: number) {
  const ids = readIds().filter((n) => n !== exclude);
  const query = useQuery({
    queryKey: ['products', 'vistos', ids],
    queryFn: () => api<ProductPage>(`/products?ids=${ids.join(',')}&limite=${MAX}`),
    enabled: ids.length > 0,
    staleTime: 60 * 1000,
  });
  // La API no respeta el orden de los ids: se reordena del más reciente al más antiguo.
  const byId = new Map((query.data?.items ?? []).map((p) => [p.id, p]));
  const items = ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  return { items, isPending: ids.length > 0 && query.isPending };
}

