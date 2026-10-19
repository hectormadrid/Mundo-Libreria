import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, Loader2, Minus, Plus, X } from 'lucide-react';
import { ORDER_STATUS } from '../lib/format';
import { errorMessage } from '../lib/api';
import type { OrderStatus } from '../lib/types';

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500" role="status">
      <Spinner className="h-8 w-8 text-lib-blue" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <AlertTriangle className="h-12 w-12 text-lib-red" />
      <p className="font-semibold text-gray-800">{errorMessage(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-lib-blue underline">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 text-6xl text-gray-300">{icon}</div>
      <h3 className="mb-2 text-2xl font-bold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const info = ORDER_STATUS[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${info.className}`}>{info.label}</span>;
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  size = 'md',
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}) {
  const button =
    size === 'lg'
      ? 'flex h-12 w-12 items-center justify-center rounded-full text-slate-700 transition hover:bg-white hover:text-brand-700 hover:shadow disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none'
      : 'flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-brand-700 hover:shadow disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none';
  return (
    <div className={`inline-flex items-center rounded-full bg-slate-100 ring-1 ring-slate-200 ${size === 'lg' ? 'p-1' : 'p-0.5'}`}>
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={disabled || value <= 1} aria-label="Disminuir cantidad">
        <Minus className="h-4 w-4" />
      </button>
      <span className={`text-center font-bold text-slate-900 ${size === 'lg' ? 'min-w-10 text-lg' : 'min-w-8'}`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Aumentar cantidad">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  size = 'md',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
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

  if (!open) return null;
  const width = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative w-full ${width} animate-fade-in rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}
