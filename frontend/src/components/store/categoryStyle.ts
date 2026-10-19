import { BookOpen, Briefcase, Palette, PenTool, Shapes, type LucideIcon } from 'lucide-react';

interface CategoryStyle {
  icon: LucideIcon;
  /** Fondo de la tarjeta y color del texto sobre él. */
  tile: string;
  /** Burbuja del ícono. */
  badge: string;
}

const STYLES: Record<string, CategoryStyle> = {
  libreria: { icon: BookOpen, tile: 'bg-brand-600 text-white', badge: 'bg-white/15 text-white' },
  papeleria: { icon: PenTool, tile: 'bg-sun-400 text-brand-950', badge: 'bg-brand-950/10 text-brand-950' },
  oficina: { icon: Briefcase, tile: 'bg-brand-950 text-white', badge: 'bg-white/10 text-sun-300' },
  arte: { icon: Palette, tile: 'bg-cherry-500 text-white', badge: 'bg-white/15 text-white' },
};

const FALLBACK: CategoryStyle[] = [
  { icon: Shapes, tile: 'bg-cherry-500 text-white', badge: 'bg-white/15 text-white' },
  { icon: Shapes, tile: 'bg-brand-100 text-brand-950', badge: 'bg-brand-600/10 text-brand-700' },
];

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Ícono y colores de una categoría; las desconocidas reciben un estilo estable según su id. */
export function categoryStyle(nombre: string, id = 0): CategoryStyle {
  return STYLES[normalize(nombre)] ?? FALLBACK[id % FALLBACK.length];
}
