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

  /** Con `checkout`, va directo a finalizar la compra en vez de abrir el carrito. */
  const add = (productId: number, cantidad = 1, options: { checkout?: boolean } = {}) => {
    if (!session?.user) {
      toastError('Inicia sesión para agregar productos al carrito');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    addToCart.mutate(
      { productId, cantidad },
      {
        onSuccess: () => {
          if (options.checkout) return navigate('/checkout');
          toastSuccess('Producto añadido al carrito');
          openDrawer();
        },
        onError: toastError,
      },
    );
  };

  return { add, pendingId: addToCart.isPending ? addToCart.variables?.productId : undefined };
}
