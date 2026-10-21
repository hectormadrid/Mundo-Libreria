import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface CartDrawerState {
  open: boolean;
  /** Producto recién agregado, para destacarlo en el carrito lateral. */
  lastAdded: number | null;
  openDrawer: (addedProductId?: number) => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerState | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const value = useMemo(
    () => ({
      open,
      lastAdded,
      openDrawer: (addedProductId?: number) => {
        setLastAdded(addedProductId ?? null);
        setOpen(true);
      },
      closeDrawer: () => setOpen(false),
    }),
    [open, lastAdded],
  );
  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) throw new Error('useCartDrawer debe usarse dentro de CartDrawerProvider');
  return context;
}
