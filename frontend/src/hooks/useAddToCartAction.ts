import { useLocation, useNavigate } from 'react-router';
import { useCartDrawer } from '../context/CartDrawerContext';
import { toastError, toastSuccess } from '../lib/alerts';
import { useAddToCart } from './useCart';
import { useSession } from './useSession';

/** Agrega un producto al carrito; sin sesión, lleva al login y vuelve a la página actual. */
export function useAddToCartAction() {
  const { data: session } = useSession();
  const addToCart = useAddToCart();
  const { openDrawer } = useCartDrawer();
  const navigate = useNavigate();
  const location = useLocation();

  const add = (productId: number, cantidad = 1) => {
    if (!session?.user) {
      toastError('Inicia sesión para agregar productos al carrito');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    addToCart.mutate(
      { productId, cantidad },
      {
        onSuccess: () => {
          toastSuccess('Producto añadido al carrito');
          openDrawer();
        },
        onError: toastError,
      },
    );
  };

  return { add, pendingId: addToCart.isPending ? addToCart.variables?.productId : undefined };
}
