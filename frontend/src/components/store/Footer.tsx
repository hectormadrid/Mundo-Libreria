import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Banknote, Clock, CreditCard, Landmark, Mail, MapPin, Phone } from 'lucide-react';
import { BRAND_LOGO_URL } from '../../lib/assets';
import { catalogUrl, useCategories } from '../../hooks/useCatalog';
import { useSession } from '../../hooks/useSession';
import { useStoreSettings } from '../../hooks/useSettings';

export function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2.7C8.6 2.7 2.7 8.6 2.7 16c0 2.4.6 4.7 1.8 6.7l-1.9 5.5 5.7-1.9a13.3 13.3 0 0 0 7.7 2.4c7.4 0 13.3-6 13.3-13.3S23.4 2.7 16 2.7zm0 24.6c-2.2 0-4.3-.6-6.1-1.8l-.4-.3-3.4 1.1 1.1-3.2-.3-.5A11.3 11.3 0 1 1 16 27.3zm6.2-8.2c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.3-.4.3-.8.1-.4-.2-1.5-.5-2.9-1.7-1-.9-1.8-2.1-2-2.4-.2-.4 0-.5.2-.7l.5-.6c.2-.2.2-.4.4-.6.1-.2 0-.4 0-.6l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5.1.8.4 1.4.6 1.9.7.8.3 1.6.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.7-.4z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.7 0H1.3C.6 0 0 .6 0 1.3v21.4c0 .7.6 1.3 1.3 1.3h11.5v-9.3H9.7v-3.6h3.1V8.4c0-3.1 1.9-4.8 4.7-4.8 1.3 0 2.5.1 2.8.1v3.2h-1.9c-1.5 0-1.8.7-1.8 1.8v2.3h3.6l-.5 3.6h-3.1V24h6.1c.7 0 1.3-.6 1.3-1.3V1.3C24 .6 23.4 0 22.7 0z" />
    </svg>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-sun-400 hover:text-brand-950"
    >
      {children}
    </a>
  );
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-bold tracking-wider text-sun-400 uppercase">{title}</h3>
      <ul className="space-y-2.5 text-sm text-white/70">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className="transition hover:text-white hover:underline hover:underline-offset-4">
        {children}
      </Link>
    </li>
  );
}

export function Footer() {
  const { data: settings } = useStoreSettings();
  const { data: categories = [] } = useCategories();
  const { data: session } = useSession();
  const horarios = settings?.horarios ?? [];

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-950 text-white">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-sun-400/10 blur-3xl" aria-hidden="true" />

      <div className="shell relative py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div className="space-y-5">
            <Link to="/" className="inline-block rounded-2xl bg-white p-3 transition hover:scale-[1.02]">
              <img src={BRAND_LOGO_URL} alt="Mundo Librería" className="h-10 w-auto" width={600} height={177} />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Todo para tu estudio, tu oficina y tus proyectos creativos, con la atención cercana de siempre.
            </p>
            <div className="flex gap-2">
              {settings?.whatsapp && (
                <SocialLink href={settings.whatsapp} label="WhatsApp">
                  <WhatsAppIcon />
                </SocialLink>
              )}
              {settings?.instagram && (
                <SocialLink href={settings.instagram} label="Instagram">
                  <InstagramIcon />
                </SocialLink>
              )}
              {settings?.facebook && (
                <SocialLink href={settings.facebook} label="Facebook">
                  <FacebookIcon />
                </SocialLink>
              )}
            </div>
          </div>

          <Column title="Comprar">
            <FooterLink to="/catalogo">Todo el catálogo</FooterLink>
            {categories.map((c) => (
              <FooterLink key={c.id} to={catalogUrl({ categoria: c.nombre })}>
                {c.nombre}
              </FooterLink>
            ))}
            <FooterLink to={catalogUrl({ orden: 'populares' })}>Más vendidos</FooterLink>
            <FooterLink to={catalogUrl({ orden: 'recientes' })}>Novedades</FooterLink>
          </Column>

          <Column title="Mi cuenta">
            {session?.user ? (
              <>
                <FooterLink to="/perfil">Mi perfil</FooterLink>
                <FooterLink to="/mis-pedidos">Mis pedidos</FooterLink>
                <FooterLink to="/carrito">Mi carrito</FooterLink>
              </>
            ) : (
              <>
                <FooterLink to="/login">Iniciar sesión</FooterLink>
                <FooterLink to="/registro">Crear cuenta</FooterLink>
              </>
            )}
            <FooterLink to="/contacto">Contacto</FooterLink>
          </Column>

          <Column title="Visítanos">
            {settings?.direccion && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" /> {settings.direccion}
              </li>
            )}
            {settings?.telefono && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" />
                <a href={`tel:${settings.telefono.replace(/[^\d+]/g, '')}`} className="hover:text-white">
                  {settings.telefono}
                </a>
              </li>
            )}
            {settings?.correo && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" />
                <a href={`mailto:${settings.correo}`} className="break-all hover:text-white">
                  {settings.correo}
                </a>
              </li>
            )}
            {horarios.length > 0 && (
              <li className="flex gap-2.5 pt-1">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" />
                <dl className="flex-1 space-y-1">
                  {horarios.map((h, i) => (
                    <div key={i} className="flex justify-between gap-4">
                      <dt>{h.dia}</dt>
                      <dd className={`font-semibold ${/cerrado/i.test(h.horario) ? 'text-cherry-500' : 'text-white'}`}>{h.horario}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            )}
          </Column>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Mundo Librería. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Medios de pago">
            {[
              { icon: Landmark, label: 'Transferencia' },
              { icon: CreditCard, label: 'Tarjeta' },
              { icon: Banknote, label: 'Efectivo' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10">
                <Icon className="h-3.5 w-3.5" /> {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
