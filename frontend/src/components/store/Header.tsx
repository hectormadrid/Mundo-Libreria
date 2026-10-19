import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  UserRound,
  X,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { ProductPage } from '../../lib/types';
import { formatPrice } from '../../lib/format';
import { BRAND_LOGO_URL, onImageError, productImage } from '../../lib/assets';
import { toastError } from '../../lib/alerts';
import { useCart } from '../../hooks/useCart';
import { catalogUrl, useCategories } from '../../hooks/useCatalog';
import { useLogout, useSession } from '../../hooks/useSession';
import { useStoreSettings } from '../../hooks/useSettings';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { categoryStyle } from './categoryStyle';
import { Spinner } from '../ui';

export function Logo({ className = 'h-10 sm:h-12' }: { className?: string }) {
  return (
    <Link to="/" className="shrink-0 transition-transform hover:scale-[1.03]" aria-label="Mundo Librería, ir al inicio">
      <img src={BRAND_LOGO_URL} alt="Mundo Librería" className={`w-auto ${className}`} width={600} height={177} />
    </Link>
  );
}

/** Cierra un menú desplegable al hacer clic fuera o presionar Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ------------------------------------------------------------------ Buscador

function SearchBox({ className = '' }: { className?: string }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const listId = useId();
  const onCatalog = location.pathname === '/catalogo';
  const [term, setTerm] = useState(onCatalog ? (params.get('q') ?? '') : '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useDismiss(open, () => setOpen(false));
  const query = useDebounced(term.trim(), 250);

  // Mantener el texto sincronizado con la búsqueda del catálogo.
  useEffect(() => {
    setTerm(location.pathname === '/catalogo' ? (params.get('q') ?? '') : '');
  }, [params, location.pathname]);

  const suggestions = useQuery({
    queryKey: ['products', 'suggest', query],
    queryFn: () => api<ProductPage>(`/products?q=${encodeURIComponent(query)}&limite=5`),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
  const items = query.length >= 2 ? (suggestions.data?.items ?? []) : [];
  const showPanel = open && query.length >= 2;

  const goTo = (path: string) => {
    setOpen(false);
    setActive(-1);
    (document.activeElement as HTMLElement | null)?.blur();
    navigate(path);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return goTo(`/producto/${items[active].id}`);
    goTo(catalogUrl({ q: term.trim() }));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showPanel || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={submit} role="search" className="group relative">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Buscar productos
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-600" />
        <input
          id={`${listId}-input`}
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Busca cuadernos, lápices, archivadores..."
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={`${listId}-list`}
          aria-activedescendant={active >= 0 ? `${listId}-opt-${active}` : undefined}
          className="h-12 w-full rounded-full border border-slate-200 bg-slate-100/70 pr-28 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 h-9 -translate-y-1/2 rounded-full bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          Buscar
        </button>
      </form>

      {showPanel && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
          {suggestions.isPending ? (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-500">
              <Spinner className="h-4 w-4" /> Buscando...
            </div>
          ) : items.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No encontramos productos para <strong className="text-slate-800">“{query}”</strong>.
            </p>
          ) : (
            <>
              <ul id={`${listId}-list`} role="listbox" aria-label="Sugerencias" className="p-2">
                {items.map((p, i) => (
                  <li key={p.id} id={`${listId}-opt-${i}`} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => goTo(`/producto/${p.id}`)}
                      className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${i === active ? 'bg-brand-50' : ''}`}
                    >
                      <img src={productImage(p.imagen)} onError={onImageError} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 object-contain p-1 mix-blend-multiply" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{p.nombre}</span>
                        {p.categoria && <span className="block text-xs text-slate-500">{p.categoria}</span>}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{formatPrice(p.precio)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => goTo(catalogUrl({ q: query }))}
                className="flex w-full items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
              >
                Ver los {suggestions.data?.total ?? items.length} resultados
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Cuenta y carrito

function MenuItem({ to, onClick, icon, children }: { to?: string; onClick?: () => void; icon: ReactNode; children: ReactNode }) {
  const className = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900';
  return to ? (
    <Link to={to} onClick={onClick} className={className} role="menuitem">
      {icon}
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} role="menuitem">
      {icon}
      {children}
    </button>
  );
}

function AccountMenu() {
  const { data: session } = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const user = session?.user;
  const admin = session?.admin;

  if (!user && !admin) {
    return (
      <Link to="/login" className="flex items-center gap-2 rounded-full px-3 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
        <UserRound className="h-6 w-6" />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-xs text-slate-500">Hola, ingresa</span>
          <span className="block text-sm font-bold">Mi cuenta</span>
        </span>
      </Link>
    );
  }

  const name = user?.nombre ?? admin!.nombre;
  const handleLogout = () => {
    setOpen(false);
    logout.mutate(undefined, { onSuccess: () => navigate('/'), onError: toastError });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full py-1.5 pr-2 pl-1.5 text-slate-700 transition hover:bg-slate-100"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-xs text-slate-500">{admin ? 'Administrador' : 'Hola,'}</span>
          <span className="block max-w-28 truncate text-sm font-bold">{name.split(' ')[0]}</span>
        </span>
        <ChevronDown className={`hidden h-4 w-4 transition lg:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 animate-fade-in rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 [animation-duration:150ms]">
          <p className="truncate px-3 pt-2 pb-3 text-xs text-slate-500">
            Sesión iniciada como <strong className="block truncate text-sm text-slate-900">{user?.correo ?? name}</strong>
          </p>
          {admin ? (
            <MenuItem to="/admin" onClick={() => setOpen(false)} icon={<LayoutDashboard className="h-4 w-4" />}>
              Panel de administración
            </MenuItem>
          ) : (
            <>
              <MenuItem to="/perfil" onClick={() => setOpen(false)} icon={<User className="h-4 w-4" />}>
                Mi perfil
              </MenuItem>
              <MenuItem to="/mis-pedidos" onClick={() => setOpen(false)} icon={<Package className="h-4 w-4" />}>
                Mis pedidos
              </MenuItem>
            </>
          )}
          <div className="my-1 border-t border-slate-100" />
          <MenuItem onClick={handleLogout} icon={<LogOut className="h-4 w-4 text-cherry-500" />}>
            Cerrar sesión
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function CartButton() {
  const { cart } = useCart();
  const { openDrawer } = useCartDrawer();
  const [bump, setBump] = useState(false);
  const previous = useRef(cart.count);

  // Pequeña animación del contador cuando se agrega algo.
  useEffect(() => {
    if (cart.count > previous.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 400);
      previous.current = cart.count;
      return () => clearTimeout(timer);
    }
    previous.current = cart.count;
  }, [cart.count]);

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="flex items-center gap-2 rounded-full bg-brand-600 py-2 pr-2 pl-3 text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 sm:pr-4"
      aria-label={`Abrir carrito (${cart.count} productos)`}
    >
      <span className="relative">
        <ShoppingBag className="h-6 w-6" />
        <span
          className={`absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sun-400 px-1 text-[11px] font-extrabold text-brand-950 ring-2 ring-brand-600 ${bump ? 'animate-pop' : ''}`}
        >
          {cart.count}
        </span>
      </span>
      <span className="hidden pl-1 text-sm font-bold sm:inline">{formatPrice(cart.total)}</span>
    </button>
  );
}

// ------------------------------------------------------------------ Navegación

function useNavLinks() {
  const { data: categories = [] } = useCategories();
  return categories;
}

function CategoryBar() {
  const categories = useNavLinks();
  const [params] = useSearchParams();
  const location = useLocation();
  const onCatalog = location.pathname === '/catalogo';
  const current = onCatalog ? (params.get('categoria') ?? '') : null;
  const orden = onCatalog ? params.get('orden') : null;

  const link = (isActive: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
      isActive ? 'bg-brand-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <nav aria-label="Categorías" className="border-t border-slate-100">
      <div className="shell no-scrollbar flex items-center gap-1 overflow-x-auto py-2">
        <Link to="/catalogo" className={link(current === '' && !orden && !params.get('q'))}>
          Todo el catálogo
        </Link>
        {categories.map((c) => {
          const Icon = categoryStyle(c.nombre, c.id).icon;
          return (
            <Link key={c.id} to={catalogUrl({ categoria: c.nombre })} className={link(current === c.nombre.toLowerCase())}>
              <Icon className="h-4 w-4" /> {c.nombre}
            </Link>
          );
        })}
        <span className="mx-2 h-5 w-px shrink-0 bg-slate-200" aria-hidden="true" />
        <Link to={catalogUrl({ orden: 'populares' })} className={link(orden === 'populares')}>
          <TrendingUp className="h-4 w-4 text-cherry-500" /> Más vendidos
        </Link>
        <Link to={catalogUrl({ orden: 'recientes' })} className={link(orden === 'recientes')}>
          <Sparkles className="h-4 w-4 text-sun-500" /> Novedades
        </Link>
        <NavLink to="/contacto" className={({ isActive }) => `${link(isActive)} lg:ml-auto`}>
          <Phone className="h-4 w-4" /> Contacto
        </NavLink>
      </div>
    </nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const categories = useNavLinks();
  const { data: session } = useSession();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const row = 'flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold text-slate-800 transition hover:bg-slate-100';

  return (
    <div className={`fixed inset-0 z-[55] lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-brand-950/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Menú"
        className={`absolute top-0 left-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <Logo className="h-10" />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar menú">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4" onClick={(e) => (e.target as HTMLElement).closest('a') && onClose()}>
          <p className="eyebrow mb-2 px-3">Categorías</p>
          <Link to="/catalogo" className={row}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
            </span>
            Todo el catálogo
          </Link>
          {categories.map((c) => {
            const style = categoryStyle(c.nombre, c.id);
            return (
              <Link key={c.id} to={catalogUrl({ categoria: c.nombre })} className={row}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.tile}`}>
                  <style.icon className="h-5 w-5" />
                </span>
                <span className="flex-1">{c.nombre}</span>
                <span className="text-xs font-medium text-slate-400">{c.productos}</span>
              </Link>
            );
          })}
          <p className="eyebrow mt-6 mb-2 px-3">Descubre</p>
          <Link to={catalogUrl({ orden: 'populares' })} className={row}>
            <TrendingUp className="h-5 w-5 text-cherry-500" /> Más vendidos
          </Link>
          <Link to={catalogUrl({ orden: 'recientes' })} className={row}>
            <Sparkles className="h-5 w-5 text-sun-500" /> Novedades
          </Link>
          <Link to="/contacto" className={row}>
            <Phone className="h-5 w-5 text-brand-600" /> Contacto
          </Link>
          {session?.user && (
            <>
              <p className="eyebrow mt-6 mb-2 px-3">Mi cuenta</p>
              <Link to="/perfil" className={row}>
                <User className="h-5 w-5" /> Mi perfil
              </Link>
              <Link to="/mis-pedidos" className={row}>
                <Package className="h-5 w-5" /> Mis pedidos
              </Link>
            </>
          )}
        </nav>
        {!session?.user && !session?.admin && (
          <div className="border-t border-slate-100 p-4">
            <Link to="/login" onClick={onClose} className="btn-brand w-full">
              Ingresar o crear cuenta
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

function TopBar() {
  const { data: settings } = useStoreSettings();
  if (!settings?.direccion && !settings?.telefono) return null;
  return (
    <div className="bg-brand-950 text-xs text-white/80">
      <div className="shell flex h-9 items-center justify-between gap-4">
        {settings.direccion ? (
          <p className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sun-400" />
            <span className="truncate">{settings.direccion}</span>
          </p>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 items-center gap-4">
          {settings.telefono && (
            <a href={`tel:${settings.telefono.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 transition hover:text-white">
              <Phone className="h-3.5 w-3.5 text-sun-400" /> {settings.telefono}
            </a>
          )}
          {settings.whatsapp && (
            <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="hidden font-semibold text-sun-300 transition hover:text-sun-400 sm:inline">
              Escríbenos por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Encabezado

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cerrar el menú móvil al cambiar de página.
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <TopBar />
      <header className={`sticky top-0 z-40 bg-white/90 backdrop-blur-xl transition-shadow ${scrolled ? 'shadow-lg shadow-slate-900/5' : ''}`}>
        <div className="shell flex items-center gap-3 py-3 lg:gap-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Logo className="h-9 sm:h-11" />
          <SearchBox className="hidden max-w-2xl flex-1 md:block" />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <AccountMenu />
            <CartButton />
          </div>
        </div>
        <SearchBox className="shell pb-3 md:hidden" />
        <div className="hidden lg:block">
          <CategoryBar />
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
