import type { ReactNode } from 'react';
import { Clock } from 'lucide-react';
import { Logo } from './Header';

export const CONTACT = {
  telefono: '+56 9 4187 0729',
  correo: 'MundoLibreria07@gmail.com',
  direccion: "Estancilla 853, 8340518 Codegua, O'Higgins, Chile",
  whatsapp: 'https://wa.me/56941870729',
  instagram: 'https://www.instagram.com/tuusuario',
  facebook: 'https://www.facebook.com/profile.php?id=100064931640451',
};

function SocialLink({ href, label, children, className }: { href: string; label: string; children: ReactNode; className: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-110 ${className}`}
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute top-0 right-0 h-64 w-64 translate-x-32 -translate-y-32 rounded-full bg-lib-blue" />
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-lib-yellow" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <Logo dark />
            <p className="max-w-sm text-gray-300">Todo para tu estudio, oficina y proyectos creativos.</p>
            <div className="flex gap-3">
              <SocialLink href={CONTACT.whatsapp} label="WhatsApp" className="bg-green-500 hover:bg-green-600">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M16 2.7C8.6 2.7 2.7 8.6 2.7 16c0 2.4.6 4.7 1.8 6.7l-1.9 5.5 5.7-1.9a13.3 13.3 0 0 0 7.7 2.4c7.4 0 13.3-6 13.3-13.3S23.4 2.7 16 2.7zm0 24.6c-2.2 0-4.3-.6-6.1-1.8l-.4-.3-3.4 1.1 1.1-3.2-.3-.5A11.3 11.3 0 1 1 16 27.3zm6.2-8.2c-.4-.2-2.1-1-2.4-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.3-.4.3-.8.1-.4-.2-1.5-.5-2.9-1.7-1-.9-1.8-2.1-2-2.4-.2-.4 0-.5.2-.7l.5-.6c.2-.2.2-.4.4-.6.1-.2 0-.4 0-.6l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5.1.8.4 1.4.6 1.9.7.8.3 1.6.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.7-.4z" />
                </svg>
              </SocialLink>
              <SocialLink href={CONTACT.instagram} label="Instagram" className="bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              </SocialLink>
              <SocialLink href={CONTACT.facebook} label="Facebook" className="bg-blue-600 hover:bg-blue-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.7 0H1.3C.6 0 0 .6 0 1.3v21.4c0 .7.6 1.3 1.3 1.3h11.5v-9.3H9.7v-3.6h3.1V8.4c0-3.1 1.9-4.8 4.7-4.8 1.3 0 2.5.1 2.8.1v3.2h-1.9c-1.5 0-1.8.7-1.8 1.8v2.3h3.6l-.5 3.6h-3.1V24h6.1c.7 0 1.3-.6 1.3-1.3V1.3C24 .6 23.4 0 22.7 0z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-lib-yellow">
              <Clock className="h-5 w-5" /> Horarios
            </h3>
            <dl className="max-w-sm space-y-2 text-gray-300">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt>Lunes - Viernes</dt>
                <dd className="font-semibold text-white">9:00 - 20:00</dd>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <dt>Sábados</dt>
                <dd className="font-semibold text-white">19:00 - 19:00</dd>
              </div>
              <div className="flex justify-between">
                <dt>Domingos</dt>
                <dd className="font-semibold text-lib-red">Cerrado</dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Mundo Librería. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
