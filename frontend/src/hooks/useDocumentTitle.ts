import { useEffect } from 'react';

const BASE_TITLE = 'Mundo Librería';

/** Título de la pestaña del navegador mientras la página está abierta. */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} | ${BASE_TITLE}`;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
