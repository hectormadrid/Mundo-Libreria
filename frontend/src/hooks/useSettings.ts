import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StoreSettings } from '../lib/types';

export const settingsKey = ['settings'] as const;

/** Datos públicos de la tienda (contacto, horarios, transferencia), editables desde el panel. */
export function useStoreSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: () => api<StoreSettings>('/settings'), staleTime: 10 * 60 * 1000 });
}
