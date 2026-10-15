import mysql, { type Pool, type PoolConnection, type ResultSetHeader } from 'mysql2/promise';
import { config } from './config.js';

// Las filas se tipan de forma flexible; cada ruta las convierte a su formato de respuesta.
export type Row = Record<string, any>;
export type Queryable = Pool | PoolConnection;

export const pool = mysql.createPool({
  ...config.db,
  charset: 'utf8mb4',
  connectionLimit: 10,
  // DECIMAL como número y fechas como texto 'YYYY-MM-DD HH:MM:SS', igual que la versión PHP.
  decimalNumbers: true,
  dateStrings: true,
});

/* `query` escapa los parámetros `?` en el cliente; a diferencia de `execute`,
   acepta números en LIMIT/OFFSET en todas las versiones de MySQL/MariaDB. */

export async function all<T extends Row = Row>(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<T[]> {
  const [rows] = await db.query(sql, params);
  return rows as T[];
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
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result.affectedRows;
}

export async function insert(sql: string, params: unknown[] = [], db: Queryable = pool): Promise<number> {
  const [result] = await db.query<ResultSetHeader>(sql, params);
  return result.insertId;
}

export async function transaction<T>(callback: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
