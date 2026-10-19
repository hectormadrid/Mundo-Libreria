import { Router } from 'express';
import { all, one, value, type Row } from '../db.js';
import { HttpError, idParam, queryStr, send } from '../http.js';
import { imageUrl } from '../uploads.js';

export const catalogRouter = Router();
const PAGE_SIZE = 12;

export function formatProduct(p: Row) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    precio: p.precio,
    stock: p.stock ?? 0,
    imagen: imageUrl(p.imagen),
    marca: p.marca ?? null,
    color: p.color ?? null,
    categoria: p.categoria ?? null,
    // Novedad: publicado en los últimos 30 días.
    nuevo: p.creado_en ? Date.now() - new Date(p.creado_en).getTime() < 30 * 24 * 60 * 60 * 1000 : false,
  };
}

/** Escapa % y _ para que la búsqueda los trate como texto. */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/** Categorías con la cantidad de productos a la venta en cada una. */
catalogRouter.get('/categories', async (_req, res) => {
  send(
    res,
    await all(
      `SELECT c.id, c.nombre,
              (SELECT count(*) FROM productos p WHERE p.categoria_id = c.id AND p.activo AND p.stock > 0)::int AS productos
       FROM categorias c ORDER BY c.nombre`,
    ),
  );
});

const SOLD = `(SELECT coalesce(sum(i.cantidad), 0) FROM pedido_items i JOIN pedidos pe ON pe.id = i.pedido_id
               WHERE i.producto_id = p.id AND pe.estado <> 'cancelado')`;

const ORDERS: Record<string, string> = {
  recientes: 'p.id DESC',
  populares: `${SOLD} DESC, p.id DESC`,
  precio_asc: 'p.precio ASC, p.id DESC',
  precio_desc: 'p.precio DESC, p.id DESC',
  nombre: 'p.nombre ASC, p.id DESC',
};

/** Familias de una categoría, por id (?categoria_id=) o por nombre (?categoria=). */
catalogRouter.get('/families', async (req, res) => {
  let categoriaId = Number(queryStr(req, 'categoria_id')) || 0;
  const categoria = queryStr(req, 'categoria');

  if (categoriaId <= 0 && categoria) {
    categoriaId = (await value<number>('SELECT id FROM categorias WHERE lower(nombre) = lower($1)', [categoria])) ?? 0;
  }
  send(res, categoriaId > 0 ? await all('SELECT id, nombre FROM familias WHERE categoria_id = $1 ORDER BY nombre', [categoriaId]) : []);
});

catalogRouter.get('/products', async (req, res) => {
  const conditions = ['p.activo', 'p.stock > 0'];
  const params: unknown[] = [];
  const param = (v: unknown) => `$${params.push(v)}`;

  // Productos puntuales (p. ej. "vistos recientemente"): ?ids=3,7,12 (máximo 24).
  const ids = queryStr(req, 'ids')
    .split(',')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 24);
  if (ids.length > 0) conditions.push(`p.id = ANY(${param(ids)}::int[])`);

  const q = queryStr(req, 'q');
  if (q) {
    const p = param(likePattern(q));
    conditions.push(`(p.nombre ILIKE ${p} OR p.descripcion ILIKE ${p} OR p.marca ILIKE ${p})`);
  }
  const categoria = queryStr(req, 'categoria');
  if (categoria) conditions.push(`lower(c.nombre) = lower(${param(categoria)})`);
  const familia = Number(queryStr(req, 'familia')) || 0;
  if (familia > 0) conditions.push(`p.familia_id = ${param(familia)}`);
  const precioMin = Number(queryStr(req, 'precio_min')) || 0;
  if (precioMin > 0) conditions.push(`p.precio >= ${param(precioMin)}`);
  const precioMax = Number(queryStr(req, 'precio_max')) || 0;
  if (precioMax > 0) conditions.push(`p.precio <= ${param(precioMax)}`);

  const from = ` FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE ${conditions.join(' AND ')}`;
  const total = Number(await value(`SELECT count(*)${from}`, params));
  const page = Math.max(1, Number(queryStr(req, 'page')) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(queryStr(req, 'limite')) || PAGE_SIZE));
  const orden = queryStr(req, 'orden');
  const order = Object.hasOwn(ORDERS, orden) ? ORDERS[orden] : ORDERS.recientes;

  const rows = await all(
    `SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.color, p.creado_en, c.nombre AS categoria${from}
     ORDER BY ${order} LIMIT ${param(pageSize)} OFFSET ${param((page - 1) * pageSize)}`,
    params,
  );

  send(res, {
    items: rows.map(formatProduct),
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    total,
  });
});

catalogRouter.get('/products/:id', async (req, res) => {
  const id = idParam(req);
  const product = await one(
    `SELECT p.*, c.nombre AS categoria, f.nombre AS familia
     FROM productos p
     LEFT JOIN categorias c ON p.categoria_id = c.id
     LEFT JOIN familias f ON p.familia_id = f.id
     WHERE p.id = $1 AND p.activo`,
    [id],
  );
  if (!product) throw HttpError.notFound('Producto no encontrado.');

  // Primero los de la misma familia, luego el resto de la categoría.
  const similares = await all(
    `SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.creado_en, c.nombre AS categoria
     FROM productos p
     LEFT JOIN categorias c ON p.categoria_id = c.id
     WHERE p.activo AND p.stock > 0 AND p.id <> $1
       AND (p.categoria_id = $2 OR p.familia_id = $3)
     ORDER BY (p.familia_id IS NOT DISTINCT FROM $3) DESC, random() LIMIT 8`,
    [id, product.categoria_id, product.familia_id],
  );
  const vendidos = await value<number>(`SELECT ${SOLD} FROM productos p WHERE p.id = $1`, [id]);

  send(res, {
    ...formatProduct(product),
    idCategoria: product.categoria_id,
    familia: product.familia,
    idFamilia: product.familia_id,
    vendidos: Number(vendidos ?? 0),
    similares: similares.map(formatProduct),
  });
});
