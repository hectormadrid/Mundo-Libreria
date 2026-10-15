import type { Request } from 'express';
import { HttpError } from './http.js';

/**
 * Limita los intentos fallidos de inicio de sesión por IP + identificador
 * (5 intentos cada 15 minutos). Se guarda en memoria: basta para un único proceso de Node.
 */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, number[]>();

function key(req: Request, scope: string, identifier: string) {
  return `${scope}|${req.ip}|${identifier.toLowerCase()}`;
}

function recent(k: string): number[] {
  const since = Date.now() - WINDOW_MS;
  const list = (attempts.get(k) ?? []).filter((t) => t > since);
  if (list.length) attempts.set(k, list);
  else attempts.delete(k);
  return list;
}

export function checkThrottle(req: Request, scope: string, identifier: string) {
  if (recent(key(req, scope, identifier)).length >= MAX_ATTEMPTS) {
    throw new HttpError(429, 'Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo.');
  }
}

export function registerFailure(req: Request, scope: string, identifier: string) {
  const k = key(req, scope, identifier);
  attempts.set(k, [...recent(k), Date.now()]);
}

export function clearThrottle(req: Request, scope: string, identifier: string) {
  attempts.delete(key(req, scope, identifier));
}

/** Solo para las pruebas automáticas. */
export function resetThrottle() {
  attempts.clear();
}
