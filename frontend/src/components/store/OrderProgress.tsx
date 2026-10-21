import { Check, CircleDollarSign, ClipboardList, PackageCheck, Truck, XCircle, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '../../lib/types';
import { formatDate } from '../../lib/format';

const STEPS: { estado: OrderStatus; label: string; icon: LucideIcon }[] = [
  { estado: 'pendiente', label: 'Recibido', icon: ClipboardList },
  { estado: 'pagado', label: 'Pagado', icon: CircleDollarSign },
  { estado: 'enviado', label: 'Enviado', icon: Truck },
  { estado: 'entregado', label: 'Entregado', icon: PackageCheck },
];

const stepIndex = (estado: OrderStatus) => STEPS.findIndex((s) => s.estado === estado);

/** Avance del pedido: barra simple (listas) o pasos con íconos y fechas (detalle). */
export function OrderProgress({
  estado,
  seguimiento = [],
  compact = false,
}: {
  estado: OrderStatus;
  seguimiento?: { estado: OrderStatus; fecha: string }[];
  compact?: boolean;
}) {
  if (estado === 'cancelado') {
    return compact ? null : (
      <div className="flex items-center gap-3 rounded-3xl bg-cherry-50 p-5 text-cherry-600 ring-1 ring-cherry-500/20">
        <XCircle className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold">Pedido cancelado</p>
          <p className="text-sm opacity-90">Si tienes dudas, escríbenos y te ayudamos.</p>
        </div>
      </div>
    );
  }

  const current = stepIndex(estado);

  if (compact) {
    return (
      <div className="flex gap-1.5" aria-label={`Avance: ${STEPS[current]?.label ?? estado}`} role="img">
        {STEPS.map((s, i) => (
          <span key={s.estado} className={`h-1.5 flex-1 rounded-full ${i <= current ? (current === STEPS.length - 1 ? 'bg-emerald-500' : 'bg-brand-600') : 'bg-slate-200'}`} />
        ))}
      </div>
    );
  }

  // Fecha en que el pedido llegó a cada estado (la primera vez).
  const dates = new Map<OrderStatus, string>();
  for (const s of seguimiento) if (!dates.has(s.estado)) dates.set(s.estado, s.fecha);

  return (
    <ol className="grid grid-cols-4">
      {STEPS.map(({ estado: step, label, icon: Icon }, i) => {
        const done = i <= current;
        const active = i === current;
        const date = dates.get(step);
        return (
          <li key={step} className="relative flex flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
            {i > 0 && <span className={`absolute top-6 right-1/2 h-1 w-full -translate-y-1/2 ${i <= current ? 'bg-brand-600' : 'bg-slate-200'}`} aria-hidden="true" />}
            <span
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition ${
                active ? 'bg-sun-400 text-brand-950 ring-4 ring-sun-400/30' : done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done && !active ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </span>
            <span className={`mt-2 text-xs font-bold sm:text-sm ${done ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
            <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">{date ? formatDate(date, true) : ' '}</span>
            <span className="mt-0.5 text-[11px] text-slate-500 sm:hidden">{date ? formatDate(date) : ' '}</span>
          </li>
        );
      })}
    </ol>
  );
}

export const IN_PROGRESS: OrderStatus[] = ['pendiente', 'pagado', 'enviado'];
