import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Cart } from '../lib/types';
import { useSession } from './useSession';

export const cartKey = ['cart'] as const;
const EMPTY_CART: Cart = { items: [], total: 0, count: 0 };

export function useCart() {
  const { data: session } = useSession();
  const loggedIn = Boolean(session?.user);
  const query = useQuery({
    queryKey: cartKey,
    queryFn: () => api<Cart>('/cart'),
    enabled: loggedIn,
  });
  return { ...query, cart: loggedIn ? (query.data ?? EMPTY_CART) : EMPTY_CART };
}

/** Todas las operaciones del carrito devuelven el carrito actualizado. */
function useCartMutation<TVars>(request: (vars: TVars) => Promise<Cart>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
}

export function useAddToCart() {
  return useCartMutation((vars: { productId: number; cantidad?: number }) =>
    api<Cart>('/cart/items', { method: 'POST', body: vars }),
  );
}

export function useUpdateCartItem() {
  return useCartMutation(({ productId, cantidad }: { productId: number; cantidad: number }) =>
    api<Cart>(`/cart/items/${productId}`, { method: 'PATCH', body: { cantidad } }),
  );
}

export function useRemoveCartItem() {
  return useCartMutation((productId: number) => api<Cart>(`/cart/items/${productId}`, { method: 'DELETE' }));
}

export function useClearCart() {
  return useCartMutation(() => api<Cart>('/cart', { method: 'DELETE' }));
}
