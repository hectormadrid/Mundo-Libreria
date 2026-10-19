import type { Request, Response } from 'express';
import { config } from './config.js';

/** URL pública de la tienda (para enlaces en correos): APP_URL o, si no existe, la de la petición. */
export function frontendUrl(req: Request, path: string): string {
  const base = config.appUrl || `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/+$/, '')}/${path}`;
}

/** Error controlado: se responde al cliente con su código y mensaje. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }

  static badRequest = (message: string) => new HttpError(400, message);
  static unauthorized = (message = 'Debes iniciar sesión.') => new HttpError(401, message);
  static forbidden = (message = 'Acceso no autorizado.') => new HttpError(403, message);
  static notFound = (message = 'Recurso no encontrado.') => new HttpError(404, message);
  static conflict = (message: string) => new HttpError(409, message);
}

/** Todas las respuestas tienen la forma { data } o { error }. */
export function send(res: Response, data: unknown, status = 200) {
  res.status(status).json({ data });
}

// --- Lectura de datos del cuerpo (JSON o multipart) ---

type Body = Record<string, unknown>;
const body = (req: Request): Body => (req.body && typeof req.body === 'object' ? (req.body as Body) : {});

/** Texto recortado; se guarda tal cual y React lo escapa al mostrarlo. */
export function str(req: Request, key: string): string {
  const value = body(req)[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

export function nullableStr(req: Request, key: string): string | null {
  return str(req, key) || null;
}

/** Entero válido o null (acepta números o texto numérico). */
export function int(req: Request, key: string): number | null {
  const raw = str(req, key);
  return /^-?\d+$/.test(raw) ? Number(raw) : null;
}

export function positiveInt(req: Request, key: string): number | null {
  const value = int(req, key);
  return value !== null && value > 0 ? value : null;
}

export function float(req: Request, key: string): number | null {
  const raw = str(req, key);
  return raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null;
}

export function rawString(req: Request, key: string): string {
  const value = body(req)[key];
  return typeof value === 'string' ? value : '';
}

/** Identificador numérico de la URL (/productos/:id). */
export function idParam(req: Request, key = 'id'): number {
  const raw = req.params[key];
  if (typeof raw !== 'string' || !/^\d+$/.test(raw) || Number(raw) <= 0) {
    throw HttpError.badRequest('Identificador no válido.');
  }
  return Number(raw);
}

export function queryStr(req: Request, key: string): string {
  const value = req.query[key];
  return typeof value === 'string' ? value.trim() : '';
}
