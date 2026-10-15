import { Router } from 'express';
import { all, exec, insert, one, value } from '../db.js';
import { HttpError, idParam, int, send } from '../http.js';
import { requireUser, userId } from '../auth.js';

export const cartRouter = Router();

export async function cartFor(uid: number) {
  const rows = await all(
    `SELECT p.id, p.nombre, p.precio, p.imagen, p.stock, p.estado, c.cantidad
     FROM carrito c JOIN productos p ON c.id_producto = p.id
     WHERE c.id_usuario = ? ORDER BY c.id ASC`,
    [uid],
  );

  const items = rows.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    imagen: row.imagen || null,
    cantidad: row.cantidad,
    stock: row.stock,
    disponible: String(row.estado).toLowerCase() === 'activo',
    subtotal: Number(row.precio) * row.cantidad,
  }));

  return {
    items,
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    count: items.reduce((sum, i) => sum + i.cantidad, 0),
  };
}

async function availableStock(productId: number): Promise<number> {
  const product = await one("SELECT stock FROM productos WHERE id = ? AND estado = 'activo'", [productId]);
  if (!product) throw HttpError.notFound('Producto no disponible.');
  return product.stock;
}

/** Sin sesión el carrito se muestra vacío. */
cartRouter.get('/cart', async (req, res) => {
  const uid = userId(req);
  send(res, uid === null ? { items: [], total: 0, count: 0 } : await cartFor(uid));
});

cartRouter.post('/cart/items', async (req, res) => {
  const uid = requireUser(req);
  const productId = int(req, 'productId') ?? 0;
  const cantidad = Math.max(1, int(req, 'cantidad') ?? 1);

  const stock = await availableStock(productId);
  const actual = (await value<number>('SELECT cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?', [uid, productId])) ?? 0;
  if (actual + cantidad > stock) throw HttpError.conflict('No hay más stock disponible de este producto.');

  if (actual > 0) {
    await exec('UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?', [actual + cantidad, uid, productId]);
  } else {
    await insert('INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)', [uid, productId, cantidad]);
  }
  send(res, await cartFor(uid));
});

cartRouter.patch('/cart/items/:productId', async (req, res) => {
  const uid = requireUser(req);
  const productId = idParam(req, 'productId');
  const cantidad = int(req, 'cantidad') ?? 0;

  if (cantidad < 1) throw HttpError.badRequest('La cantidad debe ser al menos 1.');
  if (!(await one('SELECT id FROM carrito WHERE id_usuario = ? AND id_producto = ?', [uid, productId]))) {
    throw HttpError.notFound('El producto no está en tu carrito.');
  }
  if (cantidad > (await availableStock(productId))) throw HttpError.conflict('No hay suficiente stock para esa cantidad.');

  await exec('UPDATE carrito SET cantidad = ? WHERE id_usuario = ? AND id_producto = ?', [cantidad, uid, productId]);
  send(res, await cartFor(uid));
});

cartRouter.delete('/cart/items/:productId', async (req, res) => {
  const uid = requireUser(req);
  await exec('DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?', [uid, idParam(req, 'productId')]);
  send(res, await cartFor(uid));
});

cartRouter.delete('/cart', async (req, res) => {
  const uid = requireUser(req);
  await exec('DELETE FROM carrito WHERE id_usuario = ?', [uid]);
  send(res, await cartFor(uid));
});
