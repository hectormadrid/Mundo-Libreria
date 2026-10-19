import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useStoreSettings } from '../../hooks/useSettings';
import { PageLoader } from '../../components/ui';

const MAP_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.073263522781!2d-70.6576055!3d-34.0370029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966347baf26041cd%3A0x85a209dac1ce737a!2sMundo%20Librer%C3%ADa!5e0!3m2!1ses-419!2sar!4v1722382929430!5m2!1ses-419!2sar';

export function ContactPage() {
  const { data: settings, isPending } = useStoreSettings();
  if (isPending) return <PageLoader />;

  const items = [
    settings?.telefono && { icon: Phone, label: 'Teléfono', value: settings.telefono, href: `tel:${settings.telefono.replace(/\s/g, '')}` },
    settings?.correo && { icon: Mail, label: 'Correo', value: settings.correo, href: `mailto:${settings.correo}` },
    settings?.direccion && { icon: MapPin, label: 'Dirección', value: settings.direccion },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid items-start gap-8 md:grid-cols-2">
        <div className="card p-8">
          <h1 className="mb-4 text-3xl font-bold text-lib-blue">Contáctanos</h1>
          <p className="mb-6 text-gray-700">¿Tienes dudas o consultas? Puedes comunicarte con nosotros por estos medios:</p>
          <ul className="space-y-4">
            {items.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-lib-red" />
                <div>
                  <p className="font-bold text-lib-red">{label}</p>
                  {href ? (
                    <a href={href} className="text-gray-800 hover:text-lib-blue">
                      {value}
                    </a>
                  ) : (
                    <p className="text-gray-800">{value}</p>
                  )}
                </div>
              </li>
            ))}
            {settings && settings.horarios.length > 0 && (
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-lib-red" />
                <div>
                  <p className="font-bold text-lib-red">Horarios</p>
                  {settings.horarios.map((h, i) => (
                    <p key={i} className="text-gray-800">
                      {h.dia}: {h.horario}
                    </p>
                  ))}
                </div>
              </li>
            )}
          </ul>
        </div>
        <div className="h-[400px] overflow-hidden rounded-2xl border shadow-sm">
          <iframe title="Ubicación de Mundo Librería" src={MAP_URL} className="h-full w-full border-0" loading="lazy" allowFullScreen />
        </div>
      </div>
    </div>
  );
}
