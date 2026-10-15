import fs from 'node:fs';
import pg, { type PoolClient } from 'pg';
import { config } from './config.js';

// COUNT(*) y SUM() devuelven bigint, que `pg` entrega como texto: aquí se convierten a número
// (los valores de la tienda caben de sobra en un número de JavaScript).
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

// Las filas se tipan de forma flexible; cada ruta las convierte a su formato de respuesta.
export type Row = Record<string, any>;
export type Queryable = pg.Pool | PoolClient;

function sslOptions(): pg.PoolConfig['ssl'] {
  const host = new URL(config.db.url).hostname;
  if (['localhost', '127.0.0.1', '::1'].includes(host)) return false;
  if (config.db.caCertPath) return { ca: fs.readFileSync(config.db.caCertPath, 'utf8') };
  // Conexión cifrada; para además verificar el servidor, define DATABASE_CA_CERT.
  return { rejectUnauthorized: false };
}

/** En `pg`, los parámetros ssl* de la URL reemplazan la opción `ssl`; se quitan para que mande sslOptions(). */
function connectionString(): string {
  const url = new URL(config.db.url);
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith('ssl')) url.searchParams.delete(key);
  }
  return url.toString();
}

export const pool = new pg.Pool({
  connectionString: connectionString(),
  ssl: sslOptions(),
  max: config.db.poolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => console.error('Error inesperado en la conexión a la base de datos:', error));

/* Las consultas usan parámetros $1, $2... (nunca concatenar valores en el SQL). */

export async function all<T extends Row = Row>(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<T[]> {
  const result = await db.query(sql, params);
  return result.rows as T[];
}

export async function one<T extends Row = Row>(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<T | null> {
  const rows = await all<T>(sql, params, db);
  return rows[0] ?? null;
}

export async function value<T = unknown>(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<T | null> {
  const row = await one(sql, params, db);
  return row ? (Object.values(row)[0] as T) : null;
}

/** INSERT/UPDATE/DELETE: devuelve las filas afectadas. */
export async function exec(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<number> {
  const result = await db.query(sql, params);
  return result.rowCount ?? 0;
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Código de error de Postgres para violaciones de unicidad (correo o RUT repetido, etc.). */
export const UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string })?.code === UNIQUE_VIOLATION;
}
