import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, PackageCheck, Zap } from 'lucide-react';
import { BRAND_LOGO_URL, onImageError, productImage } from '../../lib/assets';
import { useProductShelf } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { GlobeLines } from '../../components/store/GlobeLines';

/** Pantallas de acceso: formulario a la izquierda y panel de la marca a la derecha (en pantallas grandes). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  useDocumentTitle(title);
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="Mundo Librería, ir al inicio" className="transition hover:scale-[1.03]">
            <img src={BRAND_LOGO_URL} alt="Mundo Librería" className="h-10 w-auto sm:h-11" width={600} height={177} />
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Volver a la</span> tienda
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="animate-fade-in">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>

        <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} Mundo Librería</p>
      </div>

      <BrandPanel />
    </div>
  );
}

function BrandPanel() {
  const { data } = useProductShelf('populares', 8);
  const images = (data?.items ?? []).filter((p) => p.imagen).slice(0, 3);
  const perks = [
    { icon: PackageCheck, text: 'Sigue tus pedidos paso a paso' },
    { icon: Zap, text: 'Compra más rápido con tus datos guardados' },
    { icon: Mail, text: 'Recibe la confirmación de cada compra' },
  ];
  const positions = ['top-[10%] right-[12%] w-40 rotate-6', 'top-[34%] left-[18%] w-36 -rotate-6 [animation-delay:-3s]', 'bottom-[6%] right-[30%] w-32 rotate-3 [animation-delay:-5s]'];

  return (
    <aside className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white lg:sticky lg:top-0 lg:flex lg:h-screen" aria-hidden="true">
      <GlobeLines className="absolute -right-32 -bottom-40 h-[38rem] w-[38rem] text-white/[0.07]" />
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sun-400/20 blur-3xl" />

      {/* Las fotos ocupan el espacio libre sobre el texto, sin taparlo. */}
      <div className="relative min-h-0 flex-1">
        {images.map((p, i) => (
          <div key={p.id} className={`absolute animate-float-slow rounded-3xl bg-white p-3 shadow-2xl shadow-brand-950/40 ${positions[i]}`}>
            <img src={productImage(p.imagen)} onError={onImageError} alt="" className="aspect-square w-full rounded-2xl bg-slate-50 object-contain p-3 mix-blend-multiply" />
          </div>
        ))}
      </div>

      <div className="relative p-12 pt-6 xl:p-16 xl:pt-8">
        <p className="font-display text-4xl leading-tight font-semibold xl:text-5xl">
          Todo para <span className="italic text-sun-400">crear, estudiar</span> y trabajar mejor.
        </p>
        <ul className="mt-8 space-y-3">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white/85">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Icon className="h-4 w-4 text-sun-400" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Aviso de éxito o error dentro de las pantallas de acceso. */
export function Notice({ tone, icon, title, children }: { tone: 'success' | 'error'; icon: ReactNode; title: string; children?: ReactNode }) {
  const styles = tone === 'success' ? 'bg-emerald-50 text-emerald-900 ring-emerald-200' : 'bg-cherry-50 text-cherry-600 ring-cherry-500/20';
  return (
    <div className={`flex gap-3 rounded-3xl p-5 ring-1 ${styles}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="shrink-0">{icon}</span>
      <div>
        <p className="font-bold">{title}</p>
        {children && <div className="mt-1 text-sm opacity-90">{children}</div>}
      </div>
    </div>
  );
}
