import type { SyntheticEvent } from 'react';

const BASE = import.meta.env.BASE_URL;

export const LOGO_URL = `${BASE}assets/MUNDO-WEB.ico`;
/** Logo horizontal completo (globo + nombre). */
export const BRAND_LOGO_URL = `${BASE}assets/logo-mundo-libreria.webp`;

// Marcador para productos sin foto: el globo del logo en tonos suaves.
const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#eef1fd"/><g fill="none" stroke="#bac7f7" stroke-width="2.5"><circle cx="100" cy="92" r="40"/><ellipse cx="100" cy="92" rx="16" ry="40"/><ellipse cx="100" cy="92" rx="30" ry="40"/><path d="M60 92h80M65 72h70M65 112h70M100 52v80"/></g><text x="100" y="160" font-family="system-ui,sans-serif" font-size="12" font-weight="600" fill="#8ea2f0" text-anchor="middle">Sin imagen</text></svg>`,
  );

/** La API entrega la URL completa de la imagen (Supabase Storage). */
export function productImage(imagen: string | null | undefined): string {
  return imagen || PLACEHOLDER;
}

/** Si la imagen no existe en el servidor, mostrar el marcador en su lugar. */
export function onImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
}
