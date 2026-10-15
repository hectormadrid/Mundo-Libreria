import type { SyntheticEvent } from 'react';

const BASE = import.meta.env.BASE_URL;

export const LOGO_URL = `${BASE}assets/MUNDO-WEB.ico`;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="110" font-family="sans-serif" font-size="56" text-anchor="middle">📚</text></svg>',
  );

export function productImage(imagen: string | null | undefined): string {
  return imagen ? `${BASE}uploads/productos/${encodeURIComponent(imagen)}` : PLACEHOLDER;
}

/** Si la imagen no existe en el servidor, mostrar el marcador en su lugar. */
export function onImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
}
