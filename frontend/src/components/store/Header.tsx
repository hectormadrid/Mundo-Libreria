import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { LogOut, Package, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLogout, useSession } from '../../hooks/useSession';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LOGO_URL } from '../../lib/assets';
import { toastError } from '../../lib/alerts';

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3">
      <span className="rounded-full bg-white p-2 shadow-lg transition-transform group-hover:scale-110">
        <img src={LOGO_URL} alt="" className="h-8 w-8" />
      </span>
      <span className={`text-2xl font-bold sm:text-3xl ${dark ? 'text-white' : ''}`}>
        Mundo <span className="text-lib-yellow">Librería</span>
      </span>
    </Link>
  );
}

function SearchBox() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState(params.get('q') ?? '');

  // Mantener el texto sincronizado si la búsqueda cambia desde otro lugar (p. ej. "Inicio").
  useEffect(() => {
    setTerm(params.get('q') ?? '');
  }, [params]);

  // Búsqueda en vivo en la página de inicio, con una pequeña espera entre teclas.
  useEffect(() => {
    if (location.pathname !== '/') return;
    const current = params.get('q') ?? '';
    if (term.trim() === current) return;
    const timer = setTimeout(() => navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/', { replace: true }), 500);
    return () => clearTimeout(timer);
  }, [term, location.pathname, params, navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/');
  };

  return (
    <form onSubmit={submit} role="search" className="glass flex items-center rounded-full p-1">
      <label htmlFor="search" className="sr-only">
        Buscar productos
      </label>
      <input
        id="search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="¿Qué buscas hoy?"
        className="w-40 rounded-l-full bg-white/90 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 outline-none sm:w-56 md:w-64"
      />
      <button type="submit" className="rounded-r-full bg-lib-yellow px-4 py-2.5 text-lib-blue transition hover:bg-yellow-300" aria-label="Buscar">
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
}

export function Header() {
  const { data: session } = useSession();
  const { cart } = useCart();
  const { openDrawer } = useCartDrawer();
  const logout = useLogout();
  const navigate = useNavigate();
  const user = session?.user;

  const handleLogout = () =>
    logout.mutate(undefined, {
      onSuccess: () => navigate('/'),
      onError: toastError,
    });

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-lib-blue via-lib-blue to-blue-600 text-white shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-32 -translate-y-32 rounded-full bg-lib-yellow" />
        <div className="absolute right-0 bottom-0 h-48 w-48 translate-x-24 translate-y-24 animate-float rounded-full bg-lib-red" />
      </div>

      <div className="relative z-10 container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 lg:flex-row">
        <Logo />

        <div className="flex flex-wrap items-center justify-center gap-3">
          <SearchBox />

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/perfil" className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/10" title="Mi perfil">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lib-yellow font-bold text-lib-blue">
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="hidden font-semibold md:inline">¡Hola, {user.nombre.split(' ')[0]}!</span>
              </Link>
              <Link to="/mis-pedidos" className="rounded-full p-2 transition hover:bg-white/10" title="Mis pedidos" aria-label="Mis pedidos">
                <Package className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="flex items-center gap-1 rounded-full bg-lib-red px-4 py-2 text-sm font-semibold shadow-lg transition hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full bg-lib-yellow px-5 py-2.5 font-medium text-lib-blue shadow-lg transition hover:scale-105 hover:bg-yellow-400"
            >
              <User className="h-5 w-5" />
              Iniciar sesión
            </Link>
          )}

          <button
            type="button"
            onClick={openDrawer}
            className="relative rounded-full bg-white/15 p-3 transition hover:bg-white/25"
            aria-label={`Abrir carrito (${cart.count} productos)`}
          >
            <ShoppingCart className="h-6 w-6" />
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-lib-red px-1 text-xs font-bold">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
