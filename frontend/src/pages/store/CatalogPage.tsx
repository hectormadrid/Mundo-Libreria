import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Family, ProductOrder, ProductPage } from '../../lib/types';
import { formatNumber, formatPrice } from '../../lib/format';
import { useCategories } from '../../hooks/useCatalog';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';
import { ProductCard, ProductGridSkeleton } from '../../components/store/ProductCard';
import { categoryStyle } from '../../components/store/categoryStyle';
import { EmptyState, ErrorState, Spinner } from '../../components/ui';

const ORDER_OPTIONS: { value: ProductOrder; label: string }[] = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'populares', label: 'Más vendidos' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'nombre', label: 'Nombre (A-Z)' },
];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const familia = params.get('familia') ?? '';
  const q = params.get('q') ?? '';
  const orden = (params.get('orden') as ProductOrder | null) ?? 'recientes';
  const precioMin = params.get('precio_min') ?? '';
  const precioMax = params.get('precio_max') ?? '';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { add, pendingId } = useAddToCartAction();
  const { data: categories = [] } = useCategories();

  const families = useQuery({
    queryKey: ['families', categoria],
    queryFn: () => api<Family[]>(`/families?categoria=${encodeURIComponent(categoria)}`),
    enabled: categoria !== '',
  });

  const products = useInfiniteQuery({
    queryKey: ['products', { categoria, familia, q, orden, precioMin, precioMax }],
    queryFn: ({ pageParam }) => {
      const search = new URLSearchParams({ page: String(pageParam), orden });
      if (categoria) search.set('categoria', categoria);
      if (familia) search.set('familia', familia);
      if (q) search.set('q', q);
      if (precioMin) search.set('precio_min', precioMin);
      if (precioMax) search.set('precio_max', precioMax);
      return api<ProductPage>(`/products?${search}`);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
  });

  /** Cambia filtros manteniendo el resto; `null` los quita. */
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  };

  const items = products.data?.pages.flatMap((p) => p.items) ?? [];
  const total = products.data?.pages[0]?.total ?? 0;
  const category = categories.find((c) => c.nombre.toLowerCase() === categoria);
  const categoryName = category?.nombre ?? capitalize(categoria);
  const family = families.data?.find((f) => String(f.id) === familia);

  const title = q
    ? `Resultados para “${q}”`
    : categoria
      ? (family?.nombre ?? categoryName)
      : orden === 'populares'
        ? 'Más vendidos'
        : params.get('orden') === 'recientes'
          ? 'Novedades'
          : 'Todo el catálogo';

  const chips: { label: string; clear: Record<string, null> }[] = [];
  if (q) chips.push({ label: `Búsqueda: ${q}`, clear: { q: null } });
  if (categoria) chips.push({ label: categoryName, clear: { categoria: null, familia: null } });
  if (family) chips.push({ label: family.nombre, clear: { familia: null } });
  if (precioMin || precioMax) {
    const label = precioMin && precioMax
      ? `${formatPrice(Number(precioMin))} – ${formatPrice(Number(precioMax))}`
      : precioMin ? `Desde ${formatPrice(Number(precioMin))}` : `Hasta ${formatPrice(Number(precioMax))}`;
    chips.push({ label, clear: { precio_min: null, precio_max: null } });
  }

  const filters = (
    <Filters
      categoria={categoria}
      precioMin={precioMin}
      precioMax={precioMax}
      onCategory={(nombre) => update({ categoria: nombre?.toLowerCase() ?? null, familia: null })}
      onPrice={(min, max) => update({ precio_min: min, precio_max: max })}
    />
  );

  return (
    <>
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-brand-50 to-white">
        <div className="shell py-8 lg:py-10">
          <nav aria-label="Ruta" className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link to="/" className="hover:text-brand-700">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/catalogo" className="hover:text-brand-700">Catálogo</Link>
            {categoria && (
              <>
                <ChevronRight className="h-4 w-4" />
                <button type="button" onClick={() => update({ familia: null })} className="hover:text-brand-700">
                  {categoryName}
                </button>
              </>
            )}
            {family && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-700">{family.nombre}</span>
              </>
            )}
          </nav>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="mt-2 text-slate-600">
            {products.isSuccess ? `${formatNumber(total)} producto${total === 1 ? '' : 's'}` : 'Cargando productos...'}
          </p>

          {categoria && families.data && families.data.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ id: 0, nombre: 'Todo' }, ...families.data].map((f) => {
                const active = f.id === 0 ? !familia : familia === String(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => update({ familia: f.id ? String(f.id) : null })}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-300'
                    }`}
                  >
                    {f.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="shell grid gap-8 py-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-40">{filters}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setFiltersOpen(true)} className="btn-outline py-2.5 lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            <div className="flex flex-1 flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => update(chip.clear)}
                  className="flex items-center gap-1.5 rounded-full bg-brand-50 py-1.5 pr-2 pl-3 text-sm font-semibold text-brand-800 ring-1 ring-brand-100 transition hover:bg-brand-100"
                  aria-label={`Quitar filtro ${chip.label}`}
                >
                  {chip.label} <X className="h-3.5 w-3.5" />
                </button>
              ))}
              {chips.length > 1 && (
                <Link to="/catalogo" className="px-2 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
                  Limpiar todo
                </Link>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="hidden sm:inline">Ordenar por</span>
              <select
                value={orden}
                onChange={(e) => update({ orden: e.target.value === 'recientes' ? null : e.target.value })}
                className="h-11 rounded-full border border-slate-200 bg-white pr-9 pl-4 text-sm font-semibold text-slate-900 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              >
                {ORDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {products.isError ? (
            <ErrorState error={products.error} onRetry={() => void products.refetch()} />
          ) : products.isSuccess && items.length === 0 ? (
            <EmptyState icon={<SearchX className="mx-auto h-16 w-16" />} title="No encontramos lo que buscas">
              <p className="mb-6 max-w-md text-slate-500">Prueba con otras palabras o quita algunos filtros.</p>
              <Link to="/catalogo" className="btn-brand px-8">
                Ver todo el catálogo
              </Link>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {products.isPending ? (
                <ProductGridSkeleton />
              ) : (
                items.map((product, i) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${(i % 12) * 35}ms` }}>
                    <ProductCard product={product} onAdd={add} adding={pendingId === product.id} />
                  </div>
                ))
              )}
            </div>
          )}

          {products.isSuccess && items.length > 0 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <p className="text-sm text-slate-500">
                Mostrando {formatNumber(items.length)} de {formatNumber(total)}
              </p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(items.length / Math.max(total, 1)) * 100}%` }} />
              </div>
              {products.hasNextPage && (
                <button type="button" onClick={() => void products.fetchNextPage()} disabled={products.isFetchingNextPage} className="btn-outline px-8">
                  {products.isFetchingNextPage && <Spinner className="h-4 w-4" />}
                  Cargar más productos
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} total={total}>
        {filters}
      </FilterSheet>
    </>
  );
}

// ------------------------------------------------------------------ Filtros

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-200/70 pb-6 last:border-0">
      <h2 className="mb-3 text-sm font-bold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Filters({
  categoria,
  precioMin,
  precioMax,
  onCategory,
  onPrice,
}: {
  categoria: string;
  precioMin: string;
  precioMax: string;
  onCategory: (nombre: string | null) => void;
  onPrice: (min: string | null, max: string | null) => void;
}) {
  const { data: categories = [] } = useCategories();
  const [min, setMin] = useState(precioMin);
  const [max, setMax] = useState(precioMax);

  useEffect(() => {
    setMin(precioMin);
    setMax(precioMax);
  }, [precioMin, precioMax]);

  const applyPrice = (e: FormEvent) => {
    e.preventDefault();
    const clean = (v: string) => (Number(v) > 0 ? String(Math.round(Number(v))) : null);
    onPrice(clean(min), clean(max));
  };

  const option = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition ${active ? 'bg-brand-50 font-bold text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`;

  return (
    <div className="space-y-6">
      <FilterGroup title="Categorías">
        <ul className="space-y-1">
          <li>
            <button type="button" onClick={() => onCategory(null)} className={option(!categoria)}>
              <span className="flex-1">Todas</span>
            </button>
          </li>
          {categories.map((c) => {
            const style = categoryStyle(c.nombre, c.id);
            return (
              <li key={c.id}>
                <button type="button" onClick={() => onCategory(c.nombre)} className={option(categoria === c.nombre.toLowerCase())}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${style.tile}`}>
                    <style.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1">{c.nombre}</span>
                  <span className="text-xs text-slate-400">{c.productos}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Precio">
        <form onSubmit={applyPrice} className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <span className="sr-only">Precio mínimo</span>
              <input type="number" min={0} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Mínimo" className="input rounded-xl py-2 text-sm" />
            </label>
            <span className="text-slate-400">–</span>
            <label className="flex-1">
              <span className="sr-only">Precio máximo</span>
              <input type="number" min={0} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Máximo" className="input rounded-xl py-2 text-sm" />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['', '1000', 'Hasta $1.000'],
              ['1000', '5000', '$1.000 – $5.000'],
              ['5000', '', 'Más de $5.000'],
            ].map(([a, b, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => onPrice(a || null, b || null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  precioMin === a && precioMax === b ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:ring-brand-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-brand w-full py-2.5">
            Aplicar precio
          </button>
        </form>
      </FilterGroup>
    </div>
  );
}

function FilterSheet({ open, onClose, total, children }: { open: boolean; onClose: () => void; total: number; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[55] lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div
        role="dialog"
        aria-label="Filtros"
        className={`absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Filtros</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar filtros">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="border-t border-slate-100 p-4">
          <button type="button" onClick={onClose} className="btn-brand w-full">
            Ver {formatNumber(total)} producto{total === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
}
