import { Router } from 'express';
import { all, one, value, type Row } from '../db.js';
import { HttpError, idParam, queryStr, send } from '../http.js';

export const catalogRouter = Router();
const PAGE_SIZE = 12;

export function formatProduct(p: Row) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    precio: Number(p.precio),
    stock: p.stock ?? 0,
    imagen: p.imagen || null,
    marca: p.marca ?? null,
    color: p.color ?? null,
    categoria: p.categoria ?? null,
  };
}

catalogRouter.get('/categories', async (_req, res) => {
  send(res, await all('SELECT id, nombre FROM categorias ORDER BY nombre ASC'));
});

/** Familias de una categoría, por id (?categoria_id=) o por nombre (?categoria=). */
catalogRouter.get('/families', async (req, res) => {
  let categoriaId = Number(queryStr(req, 'categoria_id')) || 0;
  const categoria = queryStr(req, 'categoria');

  if (categoriaId <= 0 && categoria) {
    categoriaId = (await value<number>('SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?)', [categoria])) ?? 0;
  }
  send(res, categoriaId > 0 ? await all('SELECT id, nombre FROM familias WHERE id_categoria = ? ORDER BY nombre ASC', [categoriaId]) : []);
});

catalogRouter.get('/products', async (req, res) => {
  const conditions = ["p.estado = 'activo'", 'p.stock > 0'];
  const params: unknown[] = [];

  const q = queryStr(req, 'q');
  if (q) {
    conditions.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR p.marca LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  const categoria = queryStr(req, 'categoria');
  if (categoria) {
    conditions.push('LOWER(c.nombre) = LOWER(?)');
    params.push(categoria);
  }
  const familia = Number(queryStr(req, 'familia')) || 0;
  if (familia > 0) {
    conditions.push('p.id_familia = ?');
    params.push(familia);
  }

  const from = ` FROM productos p LEFT JOIN categorias c ON p.id_categoria = c.id WHERE ${conditions.join(' AND ')}`;
  const total = Number(await value(`SELECT COUNT(*)${from}`, params));
  const page = Math.max(1, Number(queryStr(req, 'page')) || 1);

  const rows = await all(
    `SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock, p.marca, p.color, c.nombre AS categoria${from}
     ORDER BY p.id DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
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
     LEFT JOIN categorias c ON p.id_categoria = c.id
     LEFT JOIN familias f ON p.id_familia = f.id
     WHERE p.id = ? AND p.estado = 'activo'`,
    [id],
  );
  if (!product) throw HttpError.notFound('Producto no encontrado.');

  const similares = await all(
    `SELECT p.id, p.nombre, p.imagen, p.precio, p.descripcion, p.stock
     FROM productos p
     WHERE p.estado = 'activo' AND p.stock > 0 AND p.id != ?
       AND (p.id_categoria = ? OR p.id_familia = ?)
     ORDER BY RAND() LIMIT 4`,
    [id, product.id_categoria ?? 0, product.id_familia ?? 0],
  );

  send(res, {
    ...formatProduct(product),
    idCategoria: product.id_categoria,
    familia: product.familia,
    idFamilia: product.id_familia,
    similares: similares.map(formatProduct),
  });
});
