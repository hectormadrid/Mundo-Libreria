import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  CreditCard,
  Expand,
  History,
  PackageCheck,
  PackageX,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { ProductDetail } from '../../lib/types';
import { formatNumber, formatPrice } from '../../lib/format';
import { onImageError, productImage } from '../../lib/assets';
import { toastError, toastSuccess } from '../../lib/alerts';
import { catalogUrl } from '../../hooks/useCatalog';
import { useCart } from '../../hooks/useCart';
import { useStoreSettings } from '../../hooks/useSettings';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { rememberViewed, useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useAddToCartAction } from '../../hooks/useAddToCartAction';
import { EmptyState, ErrorState, QuantityStepper, Spinner } from '../../components/ui';
import { LOW_STOCK, ProductRail } from '../../components/store/ProductCard';
import { WhatsAppIcon } from '../../components/store/Footer';

export function ProductPage() {
  const { id } = useParams();
  const { data: product, isPending, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api<ProductDetail>(`/products/${id}`),
  });
  useDocumentTitle(product?.nombre);

  useEffect(() => {
    if (product) rememberViewed(product.id);
  }, [product]);

  if (isPending) return <ProductSkeleton />;
  if (error instanceof ApiError && error.status === 404) {
    return (
      <EmptyState icon={<PackageX className="mx-auto h-16 w-16" />} title="Producto no encontrado">
        <p className="mb-6 text-slate-500">Puede que ya no esté disponible.</p>
        <Link to="/catalogo" className="btn-brand px-8">
          Ver el catálogo
        </Link>
      </EmptyState>
    );
  }
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  // `key` reinicia la cantidad y la galería al pasar a otro producto.
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }: { product: ProductDetail }) {
  const { add, pendingId } = useAddToCartAction();
  const { cart } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const recent = useRecentlyViewed(product.id);

  const enCarrito = cart.items.find((i) => i.id === product.id)?.cantidad ?? 0;
  const disponible = Math.max(0, product.stock - enCarrito);
  const adding = pendingId === product.id;
  const categoriaLink = product.categoria ? catalogUrl({ categoria: product.categoria }) : '/catalogo';

  // Barra fija en celulares cuando el botón principal sale de la pantalla (y sin tapar el pie de página).
  useEffect(() => {
    const el = ctaRef.current;
    const footer = document.querySelector('footer');
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) setCtaVisible(entry.isIntersecting);
        else setFooterVisible(entry.isIntersecting);
      }
    });
    observer.observe(el);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  const showBar = !ctaVisible && !footerVisible;

  useEffect(() => {
    if (cantidad > disponible && disponible > 0) setCantidad(disponible);
  }, [cantidad, disponible]);

  return (
    <>
      <div className="shell pt-6 pb-16">
        <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <Link to="/" className="hover:text-brand-700">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalogo" className="hover:text-brand-700">Catálogo</Link>
          {product.categoria && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link to={categoriaLink} className="hover:text-brand-700">{product.categoria}</Link>
            </>
          )}
          {product.familia && product.idFamilia && product.categoria && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link to={catalogUrl({ categoria: product.categoria, familia: product.idFamilia })} className="hover:text-brand-700">
                {product.familia}
              </Link>
            </>
          )}
          <ChevronRight className="hidden h-4 w-4 sm:block" />
          <span className="hidden max-w-60 truncate text-slate-700 sm:block">{product.nombre}</span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <Gallery product={product} />

          <div className="animate-fade-in">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {product.categoria && (
                <Link to={categoriaLink} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wider text-brand-700 uppercase hover:bg-brand-100">
                  {product.categoria}
                </Link>
              )}
              {product.familia && <span className="text-sm text-slate-500">{product.familia}</span>}
            </div>

            <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">{product.nombre}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
              {product.marca && (
                <span>
                  Marca <strong className="text-slate-900">{product.marca}</strong>
                </span>
              )}
              {product.vendidos >= 5 && (
                <span className="flex items-center gap-1 font-semibold text-cherry-600">
                  <TrendingUp className="h-4 w-4" /> {formatNumber(product.vendidos)} vendidos
                </span>
              )}
              {product.nuevo && (
                <span className="flex items-center gap-1 font-semibold text-brand-700">
                  <Sparkles className="h-4 w-4 text-sun-500" /> Recién llegado
                </span>
              )}
            </div>

            <p className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{formatPrice(product.precio)}</p>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200/70 sm:p-6">
              <StockStatus stock={product.stock} />

              {product.stock > 0 ? (
                <div ref={ctaRef} className="mt-5 space-y-3">
                  {enCarrito > 0 && (
                    <p className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
                      <ShoppingBag className="h-4 w-4 shrink-0" />
                      Ya tienes {enCarrito} en tu carrito.
                    </p>
                  )}
                  {disponible > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-3">
                        <QuantityStepper value={cantidad} max={disponible} onChange={setCantidad} size="lg" />
                        <button type="button" onClick={() => add(product.id, cantidad)} disabled={adding} className="btn-brand h-14 min-w-48 flex-1 text-base">
                          {adding ? <Spinner /> : <ShoppingBag className="h-5 w-5" />}
                          Agregar al carrito
                        </button>
                      </div>
                      <button type="button" onClick={() => add(product.id, cantidad, { checkout: true })} disabled={adding} className="btn-sun h-14 w-full text-base">
                        <Zap className="h-5 w-5" /> Comprar ahora
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Ya agregaste todas las unidades disponibles.</p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">Por ahora no tenemos unidades. Escríbenos para saber cuándo vuelve a estar disponible.</p>
              )}
            </div>

            <Perks product={product} />
          </div>
        </div>

        <Details product={product} />

        {product.similares.length > 0 && (
          <section className="pt-20">
            <SectionTitle eyebrow="Para completar tu compra" title="También te puede interesar" />
            <ProductRail products={product.similares} loading={false} onAdd={(pid) => add(pid)} pendingId={pendingId} label="Productos similares" />
          </section>
        )}

        {recent.items.length > 0 && (
          <section className="pt-14">
            <SectionTitle eyebrow="Tu historial" title="Vistos recientemente" icon={<History className="h-4 w-4" />} />
            <ProductRail products={recent.items} loading={false} onAdd={(pid) => add(pid)} pendingId={pendingId} label="Vistos recientemente" />
          </section>
        )}
      </div>

      {product.stock > 0 && disponible > 0 && (
        <div
          className={`fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgb(15_31_99/0.08)] backdrop-blur transition-transform duration-300 lg:hidden ${
            showBar ? 'translate-y-0' : 'translate-y-full'
          }`}
          aria-hidden={!showBar}
        >
          <div className="flex items-center gap-3">
            <img src={productImage(product.imagen)} onError={onImageError} alt="" className="h-12 w-12 rounded-xl bg-slate-50 object-contain p-1 mix-blend-multiply" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{product.nombre}</p>
              <p className="font-extrabold text-slate-900">{formatPrice(product.precio)}</p>
            </div>
            <button type="button" onClick={() => add(product.id, cantidad)} disabled={adding} tabIndex={showBar ? 0 : -1} className="btn-brand">
              {adding ? <Spinner className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              Agregar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------------ Galería

function Gallery({ product }: { product: ProductDetail }) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const hasImage = Boolean(product.imagen);
  const lowStock = product.stock > 0 && product.stock < LOW_STOCK;

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="lg:sticky lg:top-40">
      <div className="relative">
        <button
          type="button"
          onClick={() => hasImage && setLightbox(true)}
          onMouseMove={hasImage ? onMove : undefined}
          onMouseLeave={() => setZoom(null)}
          className={`relative block aspect-square w-full overflow-hidden rounded-[2rem] bg-slate-50 ring-1 ring-slate-200/70 ${hasImage ? 'cursor-zoom-in' : 'cursor-default'}`}
          aria-label={hasImage ? 'Ver imagen ampliada' : undefined}
          tabIndex={hasImage ? 0 : -1}
        >
          <img
            src={productImage(product.imagen)}
            onError={onImageError}
            alt={product.nombre}
            className="h-full w-full object-contain p-8 mix-blend-multiply transition-transform duration-200 ease-out sm:p-14"
            style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        </button>
        <div className="pointer-events-none absolute top-5 left-5 flex flex-col items-start gap-2">
          {product.nuevo && <span className="rounded-full bg-sun-400 px-3 py-1.5 text-xs font-bold text-brand-950 shadow">Nuevo</span>}
          {lowStock && <span className="rounded-full bg-cherry-500 px-3 py-1.5 text-xs font-bold text-white shadow">¡Últimas {product.stock}!</span>}
          {product.stock === 0 && <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow">Agotado</span>}
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <ShareButton nombre={product.nombre} />
          {hasImage && (
            <IconButton label="Ver imagen ampliada" onClick={() => setLightbox(true)}>
              <Expand className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      </div>
      {hasImage && <p className="mt-3 hidden text-center text-xs text-slate-400 lg:block">Pasa el cursor sobre la imagen para ver los detalles</p>}
      {lightbox && <Lightbox src={productImage(product.imagen)} alt={product.nombre} onClose={() => setLightbox(false)} />}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-brand-600 hover:text-white"
    >
      {children}
    </button>
  );
}

function ShareButton({ nombre }: { nombre: string }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: nombre, url });
      } else {
        await navigator.clipboard.writeText(url);
        toastSuccess('Enlace copiado');
      }
    } catch (error) {
      // Cerrar el menú de compartir no es un error.
      if (!(error instanceof DOMException && error.name === 'AbortError')) toastError('No se pudo compartir el enlace');
    }
  };
  return (
    <IconButton label="Compartir" onClick={() => void share()}>
      <Share2 className="h-5 w-5" />
    </IconButton>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-brand-950/90 p-4 backdrop-blur [animation-duration:200ms]" onClick={onClose}>
      <button type="button" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Cerrar">
        <X className="h-6 w-6" />
      </button>
      <img src={src} alt={alt} className="max-h-[90vh] max-w-full rounded-3xl bg-white object-contain p-6" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ------------------------------------------------------------------ Información

function StockStatus({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <p className="flex items-center gap-2 font-bold text-slate-700">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Agotado
      </p>
    );
  }
  if (stock < LOW_STOCK) {
    return (
      <div>
        <p className="flex items-center gap-2 font-bold text-cherry-600">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cherry-500 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cherry-500" />
          </span>
          ¡Solo quedan {stock}!
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cherry-50">
          <div className="h-full rounded-full bg-cherry-500" style={{ width: `${(stock / LOW_STOCK) * 100}%` }} />
        </div>
      </div>
    );
  }
  return (
    <p className="flex items-center gap-2 font-bold text-emerald-700">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> En stock
      <span className="font-normal text-slate-500">· {formatNumber(stock)} disponibles</span>
    </p>
  );
}

/** Enlace de WhatsApp con un mensaje inicial sobre el producto (solo para enlaces wa.me). */
function whatsappLink(base: string, nombre: string) {
  try {
    const url = new URL(base);
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      url.searchParams.set('text', `Hola, tengo una consulta sobre: ${nombre}`);
    }
    return url.toString();
  } catch {
    return base;
  }
}

function Perks({ product }: { product: ProductDetail }) {
  const { data: settings } = useStoreSettings();
  const perks = [
    { icon: CreditCard, title: 'Paga como prefieras', text: 'Transferencia, tarjeta o efectivo.' },
    { icon: PackageCheck, title: 'Sigue tu pedido', text: 'Revisa cada cambio de estado en “Mis pedidos”.' },
    { icon: ShieldCheck, title: 'Compra segura', text: 'Confirmación de tu pedido por correo.' },
  ];

  return (
    <div className="mt-6 space-y-4">
      <ul className="grid divide-y divide-slate-200/70 rounded-2xl ring-1 ring-slate-200/70 sm:grid-cols-3 sm:gap-3 sm:divide-y-0 sm:ring-0">
        {perks.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 px-4 py-3 sm:block sm:rounded-2xl sm:p-4 sm:ring-1 sm:ring-slate-200/70">
            <Icon className="h-5 w-5 shrink-0 text-brand-600 sm:mb-2" />
            <span>
              <span className="block text-sm font-bold text-slate-900">{title}</span>
              <span className="block text-xs leading-relaxed text-slate-500">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      {settings?.whatsapp && (
        <a
          href={whatsappLink(settings.whatsapp, product.nombre)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <WhatsAppIcon />
          </span>
          <span className="flex-1 text-sm">
            <strong className="block text-slate-900">¿Tienes dudas sobre este producto?</strong>
            <span className="text-slate-600">Pregúntanos por WhatsApp y te respondemos.</span>
          </span>
          <ChevronRight className="h-5 w-5 text-emerald-600 transition group-hover:translate-x-1" />
        </a>
      )}
    </div>
  );
}

function Details({ product }: { product: ProductDetail }) {
  const specs = [
    ['Marca', product.marca],
    ['Color', product.color],
    ['Categoría', product.categoria],
    ['Subcategoría', product.familia],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  if (!product.descripcion && specs.length === 0) return null;

  return (
    <section className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-[2rem] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8">
        <h2 className="mb-4 font-display text-2xl font-semibold text-slate-900">Descripción</h2>
        <p className="leading-relaxed whitespace-pre-line text-slate-600">{product.descripcion || 'Este producto aún no tiene descripción.'}</p>
      </div>
      {specs.length > 0 && (
        <div className="rounded-[2rem] bg-slate-50 p-6 ring-1 ring-slate-200/70 sm:p-8">
          <h2 className="mb-4 font-display text-2xl font-semibold text-slate-900">Ficha técnica</h2>
          <dl className="divide-y divide-slate-200">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

function SectionTitle({ eyebrow, title, icon }: { eyebrow: string; title: string; icon?: ReactNode }) {
  return (
    <div className="mb-8">
      <p className="eyebrow mb-2 flex items-center gap-2">
        {icon} {eyebrow}
      </p>
      <h2 className="section-title">{title}</h2>
    </div>
  );
}

// ------------------------------------------------------------------ Carga

function ProductSkeleton() {
  return (
    <div className="shell pt-6 pb-16" aria-busy="true" aria-label="Cargando producto">
      <div className="skeleton mb-6 h-4 w-64 rounded-full" />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="skeleton aspect-square rounded-[2rem]" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-28 rounded-full" />
          <div className="skeleton h-12 w-4/5 rounded-2xl" />
          <div className="skeleton h-4 w-40 rounded-full" />
          <div className="skeleton mt-6 h-12 w-48 rounded-2xl" />
          <div className="skeleton mt-6 h-52 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
