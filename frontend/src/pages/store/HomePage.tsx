import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { ArrowRight, ArrowUpRight, CreditCard, MessageCircle, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Store, TrendingUp } from 'lucide-react';
import type { Product } from '../../lib/types';
import { formatNumber, formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { catalogUrl, useCategories, useProductShelf } from '../../hooks/useCatalog';
import { useStoreSettings } from '../../hooks/useSettings';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';
import { ProductRail } from '../../components/store/ProductCard';
import { categoryStyle } from '../../components/store/categoryStyle';
import { WhatsAppIcon } from '../../components/store/Footer';
import { GlobeLines } from '../../components/store/GlobeLines';

export function HomePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Enlaces antiguos (/?categoria=..., /?q=...) ahora viven en el catálogo.
  if (params.has('categoria') || params.has('q') || params.has('familia')) {
    return <Navigate to={`/catalogo${location.search}`} replace />;
  }

  return (
    <>
      <Hero />
      <Benefits />
      <Categories />
      <Shelf orden="populares" eyebrow="Lo que más se llevan" title="Más vendidos" icon={<TrendingUp className="h-5 w-5" />} />
      <HelpBanner />
      <Shelf orden="recientes" eyebrow="Recién llegados" title="Novedades" icon={<Sparkles className="h-5 w-5" />} />
      <HowToBuy />
    </>
  );
}

// ------------------------------------------------------------------ Portada

function HeroCard({ product, className }: { product: Product; className: string }) {
  return (
    <Link
      to={`/producto/${product.id}`}
      className={`absolute block w-56 rounded-3xl bg-white p-3 text-slate-900 shadow-2xl shadow-brand-950/40 transition duration-300 hover:z-20 hover:scale-105 hover:rotate-0 ${className}`}
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-slate-50">
        <img src={productImage(product.imagen)} onError={onImageError} alt="" className="h-full w-full object-contain p-4 mix-blend-multiply" />
      </div>
      <p className="mt-3 line-clamp-1 px-1 text-sm font-semibold">{product.nombre}</p>
      <p className="px-1 pb-1 text-lg font-extrabold">{formatPrice(product.precio)}</p>
    </Link>
  );
}

function Hero() {
  const shelf = useProductShelf('populares', 8);
  const featured = shelf.data?.items.filter((p) => p.imagen).slice(0, 3) ?? [];
  const total = shelf.data?.total;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
      <GlobeLines className="pointer-events-none absolute -top-24 -right-24 h-[34rem] w-[34rem] text-white/[0.07] lg:right-[30%]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-sun-400/20 blur-3xl" aria-hidden="true" />

      <div className="shell relative grid items-center gap-12 pt-14 pb-28 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-36">
        <div className="animate-fade-in">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold tracking-wider text-sun-300 uppercase ring-1 ring-white/15 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sun-400" /> Librería · Papelería · Oficina
          </p>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Todo para{' '}
            <span className="relative mr-[0.12em] inline-block pr-[0.05em] italic text-sun-400">
              crear, estudiar
              <svg viewBox="0 0 300 12" className="absolute -bottom-2 left-0 w-full text-cherry-500" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 9C60 3 180 1 298 7" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
              </svg>
            </span>{' '}
            y trabajar mejor.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Cuadernos, lápices, artículos de oficina y mucho más. Elige en línea, paga como prefieras y sigue tu pedido paso a paso.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/catalogo" className="btn-sun px-7 py-4 text-base">
              Explorar catálogo <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to={catalogUrl({ orden: 'populares' })} className="btn bg-white/10 px-7 py-4 text-base text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20">
              Ver más vendidos
            </Link>
          </div>
          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {total !== undefined && <HeroStat value={formatNumber(total)} label="productos disponibles" />}
            <HeroStat value="3" label="formas de pago" />
            <HeroStat value="24/7" label="compra en línea" />
          </dl>
        </div>

        <div className="relative hidden h-[30rem] lg:block" aria-hidden={featured.length === 0}>
          {featured[0] && <HeroCard product={featured[0]} className="top-6 left-[18%] z-10 -rotate-3 animate-float-slow" />}
          {featured[1] && <HeroCard product={featured[1]} className="top-0 right-0 w-48 rotate-6 animate-float-slow [animation-delay:-3s]" />}
          {featured[2] && <HeroCard product={featured[2]} className="bottom-0 left-0 w-44 -rotate-6 animate-float-slow [animation-delay:-5s]" />}
          <div className="absolute right-6 bottom-10 z-20 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-400 text-brand-950">
              <PackageCheck className="h-5 w-5" />
            </span>
            <span className="text-sm leading-tight">
              <strong className="block">Sigue tu pedido</strong>
              <span className="text-slate-500">desde “Mis pedidos”</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-3xl font-semibold text-white">{value}</span>
        <span className="text-sm text-white/60">{label}</span>
      </dd>
    </div>
  );
}

// ------------------------------------------------------------------ Beneficios

function Benefits() {
  const items = [
    { icon: ShoppingBag, title: 'Compra fácil', text: 'Elige, agrega al carrito y listo.' },
    { icon: CreditCard, title: 'Paga como prefieras', text: 'Transferencia, tarjeta o efectivo.' },
    { icon: PackageCheck, title: 'Seguimiento', text: 'Revisa el estado de tu pedido.' },
    { icon: ShieldCheck, title: 'Compra segura', text: 'Tus datos protegidos.' },
  ];
  return (
    <section className="shell relative z-10 -mt-16 lg:-mt-20" aria-label="Beneficios">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-slate-200/70 shadow-2xl shadow-brand-950/10 ring-1 ring-slate-200/70 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex flex-col gap-3 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon className="h-6 w-6" />
            </span>
            <span>
              <strong className="block text-sm text-slate-900 sm:text-base">{title}</strong>
              <span className="text-xs text-slate-500 sm:text-sm">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ------------------------------------------------------------------ Categorías

function SectionHeader({ eyebrow, title, icon, action }: { eyebrow: string; title: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2 flex items-center gap-2">
          {icon} {eyebrow}
        </p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function SeeAll({ to, children = 'Ver todos' }: { to: string; children?: ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function Categories() {
  const { data: categories, isPending } = useCategories();
  const visible = (categories ?? []).filter((c) => c.productos > 0);
  if (!isPending && visible.length === 0) return null;

  return (
    <section className="shell pt-20">
      <SectionHeader eyebrow="Encuentra rápido" title="Explora por categoría" action={<SeeAll to="/catalogo">Todo el catálogo</SeeAll>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-48 rounded-3xl" />)
          : visible.map((c) => {
              const style = categoryStyle(c.nombre, c.id);
              return (
                <Link
                  key={c.id}
                  to={catalogUrl({ categoria: c.nombre })}
                  className={`group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl p-6 sm:h-48 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-950/20 ${style.tile}`}
                >
                  <style.icon className="absolute -right-6 -bottom-6 h-40 w-40 opacity-10 transition duration-500 group-hover:scale-110 group-hover:-rotate-12" strokeWidth={1.5} />
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.badge}`}>
                    <style.icon className="h-6 w-6" />
                  </span>
                  <span className="relative flex items-end justify-between gap-4">
                    <span>
                      <span className="block font-display text-3xl font-semibold">{c.nombre}</span>
                      <span className="text-sm opacity-75">
                        {c.productos} producto{c.productos === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-950 shadow-lg transition group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ Vitrinas

function Shelf({ orden, eyebrow, title, icon }: { orden: 'populares' | 'recientes'; eyebrow: string; title: string; icon: ReactNode }) {
  const shelf = useProductShelf(orden, 8);
  const { add, pendingId } = useAddToCartAction();
  const items = shelf.data?.items ?? [];
  if (shelf.isSuccess && items.length === 0) return null;

  return (
    <section className="shell pt-20">
      <SectionHeader eyebrow={eyebrow} title={title} icon={icon} action={<SeeAll to={catalogUrl({ orden })} />} />
      <ProductRail products={items} loading={shelf.isPending} onAdd={add} pendingId={pendingId} label={title} />
    </section>
  );
}

// ------------------------------------------------------------------ Ayuda

function HelpBanner() {
  const { data: settings } = useStoreSettings();
  return (
    <section className="shell pt-14">
      <div className="relative overflow-hidden rounded-[2rem] bg-sun-400 px-6 py-12 sm:px-12 lg:py-14">
        <GlobeLines className="pointer-events-none absolute -right-16 -bottom-24 h-80 w-80 text-brand-950/10" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-800 uppercase">¿Necesitas ayuda?</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-950 sm:text-4xl">
              ¿No encuentras lo que buscas? <span className="italic">Pregúntanos.</span>
            </h2>
            <p className="mt-3 max-w-xl text-brand-950/75">
              Cuéntanos qué necesitas para el colegio, la universidad o la oficina y te ayudamos a encontrarlo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {settings?.whatsapp && (
              <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-brand-950 px-6 py-4 text-white shadow-xl hover:bg-brand-900">
                <WhatsAppIcon /> Escribir por WhatsApp
              </a>
            )}
            <Link to="/contacto" className="btn bg-white px-6 py-4 text-brand-950 shadow-xl hover:bg-white/80">
              <MessageCircle className="h-5 w-5" /> Ver contacto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowToBuy() {
  const steps = [
    { icon: Store, title: 'Elige tus productos', text: 'Busca por nombre o recorre las categorías y agrega lo que necesites al carrito.' },
    { icon: CreditCard, title: 'Confirma y paga', text: 'Indica tus datos de contacto y paga con transferencia, tarjeta o efectivo.' },
    { icon: PackageCheck, title: 'Sigue tu pedido', text: 'Recibes la confirmación por correo y ves cada cambio de estado en “Mis pedidos”.' },
  ];
  return (
    <section className="shell pt-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="eyebrow mb-2">Así de simple</p>
        <h2 className="section-title">Cómo comprar en Mundo Librería</h2>
      </div>
      <ol className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-brand-200 md:block" aria-hidden="true" />
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative text-center">
            <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/30">
              <Icon className="h-7 w-7" />
              <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-sun-400 text-sm font-extrabold text-brand-950 ring-4 ring-white">
                {i + 1}
              </span>
            </span>
            <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
