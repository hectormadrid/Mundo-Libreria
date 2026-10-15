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

const databaseUrl = env('DATABASE_URL');
if (!/^postgres(ql)?:\/\/.+/.test(databaseUrl)) {
  const hint = databaseUrl.startsWith('sb_')
    ? 'pegaste una clave de API de Supabase; ahí va la cadena de conexión a la base de datos.'
    : databaseUrl
      ? 'el valor no es una cadena de conexión de PostgreSQL.'
      : 'está vacía.';
  console.error(
    `\nDATABASE_URL en el archivo .env no es válida: ${hint}\n` +
      'Cópiala desde el Dashboard de Supabase: botón "Connect" → "Session pooler".\n' +
      'Debe verse así: postgresql://postgres.xxxx:TU-CONTRASEÑA@aws-...pooler.supabase.com:5432/postgres\n',
  );
  process.exit(1);
}
{
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    console.error('\nDATABASE_URL está mal formada. Si la contraseña tiene caracteres como @ : / # ? %, cámbiala por una sin ellos o codifícalos.\n');
    process.exit(1);
  }
  if (/[[\]]/.test(decodeURIComponent(parsed.password))) {
    console.error(
      '\nLa contraseña en DATABASE_URL tiene corchetes [ ]. En la cadena de Supabase, [YOUR-PASSWORD] se reemplaza completo,\n' +
        'corchetes incluidos: ...postgres.xxxx:MiClave123@aws-... (no ...:[MiClave123]@...).\n',
    );
    process.exit(1);
  }
  // La conexión directa de Supabase (db.<proyecto>.supabase.co) solo funciona por IPv6 en el plan gratuito.
  if (/^db\.[a-z0-9]+\.supabase\.co$/.test(parsed.hostname)) {
    console.warn(
      '\nAviso: DATABASE_URL usa la conexión directa (db.xxxx.supabase.co), que en el plan gratuito solo funciona por IPv6.\n' +
        'Si la conexión falla por tiempo de espera, usa la del "Session pooler" (Connect → Session pooler).\n',
    );
  }
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
    url: databaseUrl,
    poolMax: Number(env('DB_POOL_MAX', '10')),
    /** Certificado raíz de Supabase (Dashboard → Database Settings → SSL) para verificar el servidor. */
    caCertPath: env('DATABASE_CA_CERT'),
  },
  supabase: {
    url: env('SUPABASE_URL').replace(/\/+$/, ''),
    secretKey: env('SUPABASE_SECRET_KEY'),
    bucket: env('SUPABASE_BUCKET', 'productos'),
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
