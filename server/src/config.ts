import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
// server/src o server/dist → raíz del proyecto
export const ROOT_DIR = path.resolve(here, '..', '..');

dotenv.config({ path: process.env.ENV_FILE ?? path.join(ROOT_DIR, '.env'), quiet: true });

const env = (key: string, fallback = '') => process.env[key]?.trim() || fallback;

const isProduction = env('NODE_ENV') === 'production';
const sessionSecret = env('SESSION_SECRET');
if (isProduction && sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres en producción.');
}

export const config = {
  isProduction,
  port: Number(env('PORT', '3000')),
  /** Necesario detrás de un proxy (cPanel, Nginx) para detectar HTTPS y la IP real. */
  trustProxy: env('TRUST_PROXY', isProduction ? '1' : ''),
  sessionSecret: sessionSecret || 'desarrollo-no-usar-en-produccion',
  appUrl: env('APP_URL'),
  publicDir: env('PUBLIC_DIR', path.join(ROOT_DIR, 'public')),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '3306')),
    database: env('DB_NAME'),
    user: env('DB_USER'),
    password: env('DB_PASS'),
  },
  smtp: {
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: Number(env('SMTP_PORT', '587')),
    user: env('SMTP_USER'),
    pass: env('SMTP_PASS'),
    fromName: env('SMTP_FROM_NAME', 'Mundo Librería'),
  },
  /** Sin SMTP configurado, los correos se escriben en este archivo. */
  mailLogPath: env('MAIL_LOG_PATH', path.join(ROOT_DIR, 'logs', 'mail_debug.log')),
};

export const uploadsDir = () => path.join(config.publicDir, 'uploads', 'productos');
