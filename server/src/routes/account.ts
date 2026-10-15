import { Router } from 'express';
import { all, exec, insert, one, transaction, type Row } from '../db.js';
import { HttpError, idParam, nullableStr, send, str } from '../http.js';
import { requireUser } from '../auth.js';
import { isEmail, isPhone } from '../validation.js';
import { orderTemplate, sendMail } from '../mail.js';

export const accountRouter = Router();

export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta'];

export function formatProfile(u: Row) {
  return { id: u.id, rut: u.rut, nombre: u.nombre, correo: u.correo, telefono: u.telefono, direccion: u.direccion };
}

export function formatOrder(o: Row) {
  return {
    id: o.id,
    total: Number(o.total),
    estado: o.estado,
    fecha: o.fecha,
    metodoPago: o.metodo_pago ?? null,
    ...('productos' in o ? { productos: Number(o.productos) } : {}),
    ...('direccion_envio' in o ? { direccionEnvio: o.direccion_envio, telefonoContacto: o.telefono_contacto } : {}),
  };
}

export async function orderItems(orderId: number) {
  const rows = await all(
    `SELECT p.id, p.nombre, p.imagen, d.cantidad, d.precio
     FROM detalle_pedido d JOIN productos p ON d.id_producto = p.id
     WHERE d.id_pedido = ?`,
    [orderId],
  );
  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    imagen: r.imagen || null,
    cantidad: r.cantidad,
    precio: Number(r.precio),
    subtotal: Number(r.precio) * r.cantidad,
  }));
}

async function profileOf(uid: number) {
  const usuario = await one('SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?', [uid]);
  if (!usuario) throw HttpError.unauthorized();
  return formatProfile(usuario);
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
  if (nombre.length > 50) throw HttpError.badRequest('El nombre no puede superar los 50 caracteres.');
  if (telefono && !isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');

  await exec('UPDATE usuario SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?', [nombre, telefono || null, direccion || null, uid]);
  send(res, await profileOf(uid));
});

accountRouter.get('/orders', async (req, res) => {
  const rows = await all(
    `SELECT p.id, p.total, p.estado, p.fecha, p.metodo_pago,
            (SELECT COALESCE(SUM(d.cantidad), 0) FROM detalle_pedido d WHERE d.id_pedido = p.id) AS productos
     FROM pedido p WHERE p.id_usuario = ? ORDER BY p.fecha DESC, p.id DESC`,
    [requireUser(req)],
  );
  send(res, rows.map(formatOrder));
});

accountRouter.get('/orders/:id', async (req, res) => {
  const order = await one(
    `SELECT id, total, estado, fecha, metodo_pago, direccion_envio, telefono_contacto
     FROM pedido WHERE id = ? AND id_usuario = ?`,
    [idParam(req), requireUser(req)],
  );
  if (!order) throw HttpError.notFound('Pedido no encontrado.');
  send(res, { ...formatOrder(order), items: await orderItems(order.id) });
});

accountRouter.post('/orders', async (req, res) => {
  const uid = requireUser(req);
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = nullableStr(req, 'telefono');
  const direccion = nullableStr(req, 'direccion');
  const metodoPago = str(req, 'metodoPago');

  if (!nombre || !correo) throw HttpError.badRequest('Completa tu nombre y correo.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato de correo no es válido.');
  if (!PAYMENT_METHODS.includes(metodoPago)) throw HttpError.badRequest('Método de pago no válido.');
  if (telefono && telefono.length > 20) throw HttpError.badRequest('El teléfono no puede superar los 20 caracteres.');
  if (direccion && direccion.length > 255) throw HttpError.badRequest('La dirección no puede superar los 255 caracteres.');

  const { orderId, total, items } = await transaction(async (conn) => {
    // Bloquear las filas para que dos compras simultáneas no vendan el mismo stock.
    const items = await all(
      `SELECT p.id, p.nombre, p.precio, p.stock, p.estado, c.cantidad
       FROM carrito c JOIN productos p ON c.id_producto = p.id
       WHERE c.id_usuario = ? FOR UPDATE`,
      [uid],
      conn,
    );
    if (!items.length) throw HttpError.badRequest('Tu carrito está vacío.');

    let total = 0;
    for (const item of items) {
      if (String(item.estado).toLowerCase() !== 'activo') throw HttpError.conflict(`El producto ya no está disponible: ${item.nombre}`);
      if (item.cantidad > item.stock) throw HttpError.conflict(`No hay suficiente stock para: ${item.nombre}`);
      total += Number(item.precio) * item.cantidad;
    }

    // Sin pasarela de pago integrada: la tarjeta se simula como pagada.
    // Transferencia y efectivo quedan pendientes hasta que un admin confirme el pago.
    const estado = metodoPago === 'tarjeta' ? 'pagado' : 'pendiente';
    const orderId = await insert(
      'INSERT INTO pedido (id_usuario, total, metodo_pago, estado, direccion_envio, telefono_contacto) VALUES (?, ?, ?, ?, ?, ?)',
      [uid, total, metodoPago, estado, direccion, telefono],
      conn,
    );

    for (const item of items) {
      await insert('INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)', [orderId, item.id, item.cantidad, item.precio], conn);
      await exec('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.id], conn);
    }
    await exec('DELETE FROM carrito WHERE id_usuario = ?', [uid], conn);

    return { orderId, total, items };
  });

  // El pedido ya está creado; un fallo del correo no debe revertirlo.
  sendMail(correo, `Confirmación de Pedido #${orderId} - Mundo Librería`, orderTemplate(nombre, orderId, total, items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio: Number(i.precio) })))).catch(
    (error) => console.error('Error al enviar email de confirmación:', error),
  );

  send(res, { id: orderId }, 201);
});
