import type { OrderStatus, PaymentMethod } from './types';

const priceFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatDate(value: string, withTime = false): string {
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/** Formatea un RUT mientras se escribe: 12345678k → 12.345.678-K */
export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${clean.slice(-1)}`;
}

export const passwordRule =
  'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.';

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^\w]/.test(password)
  );
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  pagado: { label: 'Pagado', className: 'bg-green-100 text-green-800' },
  enviado: { label: 'Enviado', className: 'bg-blue-100 text-blue-800' },
  entregado: { label: 'Entregado', className: 'bg-emerald-100 text-emerald-800' },
  cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
};

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
};
