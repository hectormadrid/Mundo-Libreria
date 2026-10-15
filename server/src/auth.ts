import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { HttpError } from './http.js';

declare module 'express-session' {
  interface SessionData {
    userId: number;
    adminId: number;
    csrfToken: string;
  }
}

export function userId(req: Request): number | null {
  return req.session.userId ?? null;
}

export function requireUser(req: Request): number {
  const id = userId(req);
  if (id === null) throw HttpError.unauthorized();
  return id;
}

export function adminId(req: Request): number | null {
  return req.session.adminId ?? null;
}

export function requireAdmin(req: Request): number {
  const id = adminId(req);
  if (id === null) throw HttpError.forbidden();
  return id;
}

export function csrfToken(req: Request): string {
  req.session.csrfToken ??= crypto.randomBytes(32).toString('hex');
  return req.session.csrfToken;
}

/**
 * Toda petición que modifica datos debe traer el token de la sesión en la cabecera X-CSRF-Token.
 * Un sitio externo no puede leer el token ni enviar esa cabecera sin pasar por CORS.
 */
export function verifyCsrf(req: Request, _res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const expected = req.session.csrfToken ?? '';
  const received = req.get('X-CSRF-Token') ?? '';
  const valid =
    expected !== '' &&
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  if (!valid) {
    return next(HttpError.forbidden('La sesión expiró o el token de seguridad no es válido. Recarga la página.'));
  }
  next();
}

/** Cambia el ID de sesión al iniciar o cerrar sesión (evita la fijación de sesión). */
export function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => req.session.regenerate((err) => (err ? reject(err) : resolve())));
}

export async function loginUser(req: Request, id: number) {
  await regenerateSession(req);
  req.session.userId = id;
}

export async function loginAdmin(req: Request, id: number) {
  await regenerateSession(req);
  req.session.adminId = id;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Acepta también los hashes creados por PHP ($2y$), que son equivalentes a $2b$. */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash.replace(/^\$2y\$/, '$2b$'));
}
