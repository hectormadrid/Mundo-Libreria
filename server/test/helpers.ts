import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net, { type AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

/**
 * Entorno de pruebas: un PostgreSQL en memoria (PGlite) con database/schema.sql,
 * expuesto por TCP para que el servidor se conecte con `pg` igual que a Supabase.
 * No necesita instalar Postgres ni tocar el proyecto de Supabase.
 */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mundo-libreria-test-'));

let pglite: PGlite;
let socketServer: PGLiteSocketServer;

/** Hash generado por PHP (password_hash) para "Admin123!": comprueba la compatibilidad con cuentas migradas. */
export const PHP_ADMIN_HASH = '$2y$10$lBD66UY4SjArgYXBC8TBNu3PbCzRIRQOFVHD6BVdcwXU.ksk4p1me';

async function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const srv = net.createServer().listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

/** Crea la base, carga el esquema y configura las variables de entorno del servidor. */
export async function startDatabase() {
  pglite = await PGlite.create();
  await pglite.exec(fs.readFileSync(path.resolve(import.meta.dirname, '../../database/schema.sql'), 'utf8'));
  await pglite.query('INSERT INTO administradores (usuario, password_hash) VALUES ($1, $2)', ['testadmin', PHP_ADMIN_HASH]);

  const port = await freePort();
  socketServer = new PGLiteSocketServer({ db: pglite, port, host: '127.0.0.1' });
  await socketServer.start();

  Object.assign(process.env, {
    ENV_FILE: path.join(tmp, 'no-existe.env'),
    NODE_ENV: 'test',
    DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${port}/postgres`,
    // PGlite atiende una conexión a la vez.
    DB_POOL_MAX: '1',
    SUPABASE_URL: '',
    SUPABASE_SECRET_KEY: '',
    PUBLIC_DIR: path.join(tmp, 'public'),
    MAIL_LOG_PATH: path.join(tmp, 'mail.log'),
    SMTP_USER: '',
    APP_URL: 'http://tienda.test',
  });
  fs.mkdirSync(process.env.PUBLIC_DIR!, { recursive: true });
  fs.writeFileSync(path.join(process.env.PUBLIC_DIR!, 'index.html'), '<!doctype html><title>App React</title>');
}

export async function stopDatabase() {
  await socketServer?.stop();
  await pglite?.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}

export const mailLog = () => (fs.existsSync(process.env.MAIL_LOG_PATH!) ? fs.readFileSync(process.env.MAIL_LOG_PATH!, 'utf8') : '');
export const uploadsDir = () => path.join(process.env.PUBLIC_DIR!, 'uploads', 'productos');

export function baseUrl(server: Server) {
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

interface Result<T = any> {
  status: number;
  body: { data?: T; error?: string } & Record<string, any>;
  text: string;
}

/** Cliente HTTP con cookies y token CSRF, como el navegador. */
export class Client {
  private cookie = '';
  csrf = '';

  constructor(private readonly base: string) {}

  async request<T = any>(method: string, url: string, body?: unknown, { csrf = true } = {}): Promise<Result<T>> {
    const headers: Record<string, string> = {};
    if (this.cookie) headers.Cookie = this.cookie;
    if (csrf && method !== 'GET') headers['X-CSRF-Token'] = this.csrf;
    let payload: BodyInit | undefined;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(this.base + url, { method, headers, body: payload });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) this.cookie = setCookie.split(';')[0];
    const text = await res.text();
    let parsed = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      /* respuesta no JSON (HTML) */
    }
    const token = (parsed as { data?: { csrfToken?: string } }).data?.csrfToken;
    if (token) this.csrf = token;
    return { status: res.status, body: parsed, text };
  }

  get = <T = any>(url: string) => this.request<T>('GET', url);
  post = <T = any>(url: string, body?: unknown, opts?: { csrf?: boolean }) => this.request<T>('POST', url, body, opts);
  put = <T = any>(url: string, body?: unknown) => this.request<T>('PUT', url, body);
  patch = <T = any>(url: string, body?: unknown) => this.request<T>('PATCH', url, body);
  delete = <T = any>(url: string) => this.request<T>('DELETE', url);

  async start() {
    await this.get('/api/auth/session');
    return this;
  }
}

// Imagen PNG mínima válida por su firma (magic bytes).
export const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4ff0000000049454e44ae426082', 'hex');
