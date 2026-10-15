import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import mysql from 'mysql2/promise';

/**
 * Entorno de pruebas: base de datos `mundo_libreria_test` creada desde database/base_de_datos.sql,
 * carpeta pública y log de correos temporales. Requiere un MySQL/MariaDB local (XAMPP).
 */
export const TEST_DB = process.env.TEST_DB_NAME ?? 'mundo_libreria_test';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mundo-libreria-test-'));

process.env.ENV_FILE = path.join(tmp, 'no-existe.env');
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.TEST_DB_HOST ?? '127.0.0.1';
process.env.DB_USER = process.env.TEST_DB_USER ?? 'root';
process.env.DB_PASS = process.env.TEST_DB_PASS ?? '';
process.env.DB_NAME = TEST_DB;
process.env.PUBLIC_DIR = path.join(tmp, 'public');
process.env.MAIL_LOG_PATH = path.join(tmp, 'mail.log');
process.env.SMTP_USER = '';
process.env.APP_URL = 'http://tienda.test';

fs.mkdirSync(process.env.PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(process.env.PUBLIC_DIR, 'index.html'), '<!doctype html><title>App React</title>');

/** Hash generado por PHP (password_hash) para "Admin123!": comprueba la compatibilidad con cuentas existentes. */
export const PHP_ADMIN_HASH = '$2y$10$lBD66UY4SjArgYXBC8TBNu3PbCzRIRQOFVHD6BVdcwXU.ksk4p1me';

export async function resetDatabase() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    multipleStatements: true,
  });
  const schema = fs
    .readFileSync(path.resolve(import.meta.dirname, '../../database/base_de_datos.sql'), 'utf8')
    .replace(/^\s*(CREATE DATABASE|USE)\b.*$/gim, '');
  await conn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\`; CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4; USE \`${TEST_DB}\`;`);
  await conn.query(schema);
  await conn.query("INSERT INTO Administrador (nombre, tipo, password) VALUES ('testadmin', 'administrador', ?)", [PHP_ADMIN_HASH]);
  await conn.end();
}

export async function dropDatabase() {
  const conn = await mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS });
  await conn.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  await conn.end();
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
    const result = { status: res.status, body: parsed, text };
    const token = (parsed as { data?: { csrfToken?: string } }).data?.csrfToken;
    if (token) this.csrf = token;
    return result;
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

// Imágenes mínimas válidas por su firma (magic bytes).
export const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4ff0000000049454e44ae426082', 'hex');
