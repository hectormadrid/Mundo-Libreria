export const PASSWORD_RULE =
  'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';

export function isEmail(value: string): boolean {
  return value.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPhone(value: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(value.replace(/ /g, ''));
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^\w]/.test(value);
}

/** RUT chileno con dígito verificador (módulo 11). Acepta 12.345.678-5 o 12345678-5. */
export function isRut(value: string): boolean {
  if (value.length > 12 || !/^[0-9.]+-?[0-9kK]$/.test(value)) return false;
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 8) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const expected = 11 - (sum % 11);
  return dv === (expected === 11 ? '0' : expected === 10 ? 'K' : String(expected));
}
