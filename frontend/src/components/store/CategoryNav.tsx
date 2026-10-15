import { NavLink, useLocation, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Category } from '../../lib/types';

const EMOJIS: Record<string, string> = { libreria: '📚', papeleria: '✏️', oficina: '💼' };

function emojiFor(nombre: string) {
  const key = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return EMOJIS[key] ?? '🏷️';
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/categories'), staleTime: 10 * 60 * 1000 });
}

const pill = 'rounded-full px-5 py-2 font-semibold shadow-lg transition-all duration-300 hover:scale-105';
const inactive = `${pill} bg-white/90 text-red-700`;
const active = `${pill} bg-lib-yellow text-lib-blue scale-105`;

export function CategoryNav() {
  const { data: categories = [] } = useCategories();
  const [params] = useSearchParams();
  const location = useLocation();
  const current = params.get('categoria')?.toLowerCase() ?? '';
  const onHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-red-700 via-red-600 to-yellow-400 shadow-lg" aria-label="Categorías">
      <div className="container mx-auto flex flex-wrap justify-center gap-3 px-4 py-3 text-sm">
        <NavLink to="/" className={onHome && !current && !params.get('q') ? active : inactive}>
          🏠 Inicio
        </NavLink>
        {categories.map((c) => (
          <NavLink
            key={c.id}
            to={`/?categoria=${encodeURIComponent(c.nombre.toLowerCase())}`}
            className={onHome && current === c.nombre.toLowerCase() ? active : inactive}
          >
            {emojiFor(c.nombre)} {c.nombre}
          </NavLink>
        ))}
        <NavLink to="/contacto" className={({ isActive }) => (isActive ? active : inactive)}>
          📞 Contacto
        </NavLink>
      </div>
    </nav>
  );
}
