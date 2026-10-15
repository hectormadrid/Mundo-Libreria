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
  };
}

/** Escapa % y _ para que la búsqueda los trate como texto. */
const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

catalogRouter.get('/categories', async (_req, res) => {
  send(res, await all('SELECT id, nombre FROM categorias ORDER BY nombre'));
});

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

  const q = queryStr(req, 'q');
  if (q) {
    const p = param(likePattern(q));
    conditions.push(`(p.nombre ILIKE ${p} OR p.descripcion ILIKE ${p} OR p.marca ILIKE ${p})`);
  }
  const categoria = queryStr(req, 'categoria');
  if (categoria) conditions.push(`lower(c.nombre) = lower(${param(categoria)})`);
  const familia = Number(queryStr(req, 'familia')) || 0;
  if (familia > 0) conditions.push(`p.familia_id = ${param(familia)}`);

  const from = ` FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE ${conditions.join(' AND ')}`;
  const total = Number(await value(`SELECT count(*)${from}`, params));
  const page = Math.max(1, Number(queryStr(req, 'page')) || 1);

  const rows = await all(
    `SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.color, c.nombre AS categoria${from}
     ORDER BY p.id DESC LIMIT ${param(PAGE_SIZE)} OFFSET ${param((page - 1) * PAGE_SIZE)}`,
    params,
  );

  send(res, {
    items: rows.map(formatProduct),
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
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

  const similares = await all(
    `SELECT id, nombre, imagen, precio, descripcion, stock
     FROM productos
     WHERE activo AND stock > 0 AND id <> $1
       AND (categoria_id = $2 OR familia_id = $3)
     ORDER BY random() LIMIT 4`,
    [id, product.categoria_id, product.familia_id],
  );

  send(res, {
    ...formatProduct(product),
    idCategoria: product.categoria_id,
    familia: product.familia,
    idFamilia: product.familia_id,
    similares: similares.map(formatProduct),
  });
});
