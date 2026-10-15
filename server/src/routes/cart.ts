import { Router } from 'express';
import { all, exec, one, value } from '../db.js';
import { HttpError, idParam, int, send } from '../http.js';
import { requireUser, userId } from '../auth.js';
import { imageUrl } from '../uploads.js';

export const cartRouter = Router();

export async function cartFor(clienteId: number) {
  const rows = await all(
    `SELECT p.id, p.nombre, p.precio, p.imagen, p.stock, p.activo, c.cantidad
     FROM carrito_items c JOIN productos p ON c.producto_id = p.id
     WHERE c.cliente_id = $1 ORDER BY c.agregado_en, p.id`,
    [clienteId],
  );

  const items = rows.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    imagen: imageUrl(row.imagen),
    cantidad: row.cantidad,
    stock: row.stock,
    disponible: row.activo,
    subtotal: row.precio * row.cantidad,
  }));

  return {
    items,
    total: items.reduce((sum, i) => sum + i.subtotal, 0),
    count: items.reduce((sum, i) => sum + i.cantidad, 0),
  };
}

async function availableStock(productId: number): Promise<number> {
  const product = await one('SELECT stock FROM productos WHERE id = $1 AND activo', [productId]);
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
  const actual = (await value<number>('SELECT cantidad FROM carrito_items WHERE cliente_id = $1 AND producto_id = $2', [uid, productId])) ?? 0;
  if (actual + cantidad > stock) throw HttpError.conflict('No hay más stock disponible de este producto.');

  await exec(
    `INSERT INTO carrito_items (cliente_id, producto_id, cantidad) VALUES ($1, $2, $3)
     ON CONFLICT (cliente_id, producto_id) DO UPDATE SET cantidad = carrito_items.cantidad + excluded.cantidad`,
    [uid, productId, cantidad],
  );
  send(res, await cartFor(uid));
});

cartRouter.patch('/cart/items/:productId', async (req, res) => {
  const uid = requireUser(req);
  const productId = idParam(req, 'productId');
  const cantidad = int(req, 'cantidad') ?? 0;

  if (cantidad < 1) throw HttpError.badRequest('La cantidad debe ser al menos 1.');
  if (!(await one('SELECT 1 FROM carrito_items WHERE cliente_id = $1 AND producto_id = $2', [uid, productId]))) {
    throw HttpError.notFound('El producto no está en tu carrito.');
  }
  if (cantidad > (await availableStock(productId))) throw HttpError.conflict('No hay suficiente stock para esa cantidad.');

  await exec('UPDATE carrito_items SET cantidad = $1 WHERE cliente_id = $2 AND producto_id = $3', [cantidad, uid, productId]);
  send(res, await cartFor(uid));
});

cartRouter.delete('/cart/items/:productId', async (req, res) => {
  const uid = requireUser(req);
  await exec('DELETE FROM carrito_items WHERE cliente_id = $1 AND producto_id = $2', [uid, idParam(req, 'productId')]);
  send(res, await cartFor(uid));
});

cartRouter.delete('/cart', async (req, res) => {
  const uid = requireUser(req);
  await exec('DELETE FROM carrito_items WHERE cliente_id = $1', [uid]);
  send(res, await cartFor(uid));
});
