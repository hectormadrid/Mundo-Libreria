import { Router } from 'express';
import { all, exec, one, transaction, type Row } from '../db.js';
import { HttpError, idParam, nullableStr, send, str } from '../http.js';
import { requireUser } from '../auth.js';
import { isEmail, isPhone } from '../validation.js';
import { orderTemplate, sendMail } from '../mail.js';
import { imageUrl } from '../uploads.js';
import { getSettings } from './settings.js';

export const accountRouter = Router();

export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta'];

export function formatProfile(c: Row) {
  return { id: c.id, rut: c.rut, nombre: c.nombre, correo: c.correo, telefono: c.telefono, direccion: c.direccion };
}

export function formatOrder(o: Row) {
  return {
    id: o.id,
    total: o.total,
    estado: o.estado,
    fecha: o.creado_en,
    metodoPago: o.metodo_pago,
    ...('productos' in o ? { productos: o.productos } : {}),
    ...('direccion_envio' in o ? { direccionEnvio: o.direccion_envio, telefonoContacto: o.telefono_contacto } : {}),
  };
}

export async function orderItems(pedidoId: number) {
  const rows = await all(
    `SELECT i.producto_id, i.nombre_producto, i.cantidad, i.precio_unitario, p.imagen
     FROM pedido_items i LEFT JOIN productos p ON i.producto_id = p.id
     WHERE i.pedido_id = $1 ORDER BY i.nombre_producto`,
    [pedidoId],
  );
  return rows.map((r) => ({
    id: r.producto_id,
    nombre: r.nombre_producto,
    imagen: imageUrl(r.imagen),
    cantidad: r.cantidad,
    precio: r.precio_unitario,
    subtotal: r.precio_unitario * r.cantidad,
  }));
}

async function profileOf(clienteId: number) {
  const cliente = await one('SELECT id, rut, nombre, correo, telefono, direccion FROM clientes WHERE id = $1', [clienteId]);
  if (!cliente) throw HttpError.unauthorized();
  return formatProfile(cliente);
}

accountRouter.get('/profile', async (req, res) => {
  send(res, await profileOf(requireUser(req)));
});

accountRouter.put('/profile', async (req, res) => {
  const uid = requireUser(req);
  const nombre = str(req, 'nombre');
  const telefono = str(req, 'telefono');
  const direccion = str(req, 'direccion');

  if (!nombre) throw HttpError.badRequest('El nombre es obligatorio.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (telefono && !isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');
  if (direccion.length > 255) throw HttpError.badRequest('La dirección no puede superar los 255 caracteres.');

  await exec('UPDATE clientes SET nombre = $1, telefono = $2, direccion = $3 WHERE id = $4', [nombre, telefono || null, direccion || null, uid]);
  send(res, await profileOf(uid));
});

accountRouter.get('/orders', async (req, res) => {
  const rows = await all(
    `SELECT p.id, p.total, p.estado, p.creado_en, p.metodo_pago,
            (SELECT coalesce(sum(i.cantidad), 0) FROM pedido_items i WHERE i.pedido_id = p.id) AS productos
     FROM pedidos p WHERE p.cliente_id = $1 ORDER BY p.creado_en DESC, p.id DESC`,
    [requireUser(req)],
  );
  send(res, rows.map(formatOrder));
});

accountRouter.get('/orders/:id', async (req, res) => {
  const order = await one(
    `SELECT id, total, estado, creado_en, metodo_pago, direccion_envio, telefono_contacto
     FROM pedidos WHERE id = $1 AND cliente_id = $2`,
    [idParam(req), requireUser(req)],
  );
  if (!order) throw HttpError.notFound('Pedido no encontrado.');
  // Seguimiento para el cliente: solo estados y fechas (sin notas internas ni quién hizo el cambio).
  const seguimiento = await all('SELECT estado, creado_en AS fecha FROM pedido_historial WHERE pedido_id = $1 ORDER BY creado_en, id', [order.id]);
  send(res, { ...formatOrder(order), items: await orderItems(order.id), seguimiento });
});

accountRouter.post('/orders', async (req, res) => {
  const uid = requireUser(req);
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = nullableStr(req, 'telefono');
  const direccion = nullableStr(req, 'direccion');
  const metodoPago = str(req, 'metodoPago');

  if (!nombre || !correo) throw HttpError.badRequest('Completa tu nombre y correo.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato de correo no es válido.');
  if (!PAYMENT_METHODS.includes(metodoPago)) throw HttpError.badRequest('Método de pago no válido.');
  if (telefono && telefono.length > 20) throw HttpError.badRequest('El teléfono no puede superar los 20 caracteres.');
  if (direccion && direccion.length > 255) throw HttpError.badRequest('La dirección no puede superar los 255 caracteres.');

  const { orderId, total, items } = await transaction(async (client) => {
    // Bloquear los productos para que dos compras simultáneas no vendan el mismo stock.
    const items = await all(
      `SELECT p.id, p.nombre, p.precio, p.stock, p.activo, c.cantidad
       FROM carrito_items c JOIN productos p ON c.producto_id = p.id
       WHERE c.cliente_id = $1 ORDER BY p.id FOR UPDATE OF p`,
      [uid],
      client,
    );
    if (!items.length) throw HttpError.badRequest('Tu carrito está vacío.');

    let total = 0;
    for (const item of items) {
      if (!item.activo) throw HttpError.conflict(`El producto ya no está disponible: ${item.nombre}`);
      if (item.cantidad > item.stock) throw HttpError.conflict(`No hay suficiente stock para: ${item.nombre}`);
      total += item.precio * item.cantidad;
    }

    // Sin pasarela de pago integrada: la tarjeta se simula como pagada.
    // Transferencia y efectivo quedan pendientes hasta que un admin confirme el pago.
    const estado = metodoPago === 'tarjeta' ? 'pagado' : 'pendiente';
    const order = await one(
      `INSERT INTO pedidos (cliente_id, estado, metodo_pago, total, nombre_contacto, correo_contacto, telefono_contacto, direccion_envio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [uid, estado, metodoPago, total, nombre, correo, telefono, direccion],
      client,
    );
    const orderId: number = order!.id;

    for (const item of items) {
      await exec(
        'INSERT INTO pedido_items (pedido_id, producto_id, nombre_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.id, item.nombre, item.cantidad, item.precio],
        client,
      );
      await exec('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.id], client);
    }
    await exec('DELETE FROM carrito_items WHERE cliente_id = $1', [uid], client);
    await exec('INSERT INTO pedido_historial (pedido_id, estado, nota) VALUES ($1, $2, $3)', [orderId, estado, 'Pedido creado por el cliente'], client);

    return { orderId, total, items };
  });

  // El pedido ya está creado; un fallo del correo no debe revertirlo.
  const datosTransferencia = metodoPago === 'transferencia' ? (await getSettings()).datosTransferencia : null;
  sendMail(
    correo,
    `Confirmación de Pedido #${orderId} - Mundo Librería`,
    orderTemplate(nombre, orderId, total, items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })), datosTransferencia),
  ).catch((error) => console.error('Error al enviar email de confirmación:', error));

  send(res, { id: orderId }, 201);
});
