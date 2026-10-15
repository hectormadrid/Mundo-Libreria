import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface CartDrawerState {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerState | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, openDrawer: () => setOpen(true), closeDrawer: () => setOpen(false) }), [open]);
  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) throw new Error('useCartDrawer debe usarse dentro de CartDrawerProvider');
  return context;
}
