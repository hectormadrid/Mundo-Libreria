import crypto from 'node:crypto';
import { Router, type Request } from 'express';
import { all, exec, one, transaction, value, type Row } from '../db.js';
import { float, frontendUrl, HttpError, idParam, int, nullableStr, positiveInt, rawString, send, str } from '../http.js';
import { orderStatusTemplate, sendMail } from '../mail.js';
import { hashPassword, requireAdmin } from '../auth.js';
import { isEmail, isPhone, isRut, isStrongPassword, PASSWORD_RULE } from '../validation.js';
import { deleteProductImage, imageUpload, imageUrl, storeProductImage } from '../uploads.js';
import { formatOrder, formatProfile, orderItems } from './account.js';
import { dashboardRouter } from './dashboard.js';
import { updateSettings } from './settings.js';

export const adminRouter = Router();

// Todas las rutas de este router requieren una sesión de administrador.
adminRouter.use((req, _res, next) => {
  requireAdmin(req);
  next();
});

// ---------------------------------------------------------------- Dashboard y configuración

adminRouter.use(dashboardRouter);

adminRouter.put('/settings', async (req, res) => {
  send(res, await updateSettings(req));
});

// ---------------------------------------------------------------- Productos

const PRODUCT_SELECT = `
  SELECT p.id, p.nombre, p.codigo_barras, p.imagen, p.precio, p.descripcion, p.marca, p.color,
         p.stock, p.activo, p.creado_en, p.categoria_id, c.nombre AS categoria,
         p.familia_id, f.nombre AS familia,
         (SELECT coalesce(sum(i.cantidad), 0) FROM pedido_items i JOIN pedidos pe ON pe.id = i.pedido_id
           WHERE i.producto_id = p.id AND pe.estado <> 'cancelado') AS vendidos
  FROM productos p
  LEFT JOIN categorias c ON p.categoria_id = c.id
  LEFT JOIN familias f ON p.familia_id = f.id`;

function formatAdminProduct(p: Row) {
  return {
    id: p.id,
    nombre: p.nombre,
    codigoBarras: p.codigo_barras,
    imagen: imageUrl(p.imagen),
    precio: p.precio,
    descripcion: p.descripcion,
    marca: p.marca,
    color: p.color,
    stock: p.stock,
    estado: p.activo ? 'activo' : 'inactivo',
    fechaCreacion: p.creado_en,
    idCategoria: p.categoria_id,
    categoria: p.categoria,
    idFamilia: p.familia_id,
    familia: p.familia,
    vendidos: p.vendidos,
  };
}

async function findProduct(id: number) {
  return formatAdminProduct((await one(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]))!);
}

async function validatedProduct(req: Request) {
  const nombre = str(req, 'nombre');
  const precio = float(req, 'precio');
  const stock = int(req, 'stock');
  const idCategoria = positiveInt(req, 'idCategoria');
  const idFamilia = positiveInt(req, 'idFamilia');
  const estado = (str(req, 'estado') || 'activo').toLowerCase();
  const marca = nullableStr(req, 'marca');
  const color = nullableStr(req, 'color');
  const codigoBarras = nullableStr(req, 'codigoBarras');

  if (!nombre) throw HttpError.badRequest('El nombre es obligatorio.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (precio === null || precio < 0 || !Number.isInteger(precio)) throw HttpError.badRequest('El precio debe ser un número entero de pesos, mayor o igual a 0.');
  if (stock === null || stock < 0) throw HttpError.badRequest('El stock debe ser un número entero mayor o igual a 0.');
  if ((marca?.length ?? 0) > 100 || (color?.length ?? 0) > 50 || (codigoBarras?.length ?? 0) > 50) {
    throw HttpError.badRequest('Marca, color o código de barras son demasiado largos.');
  }
  if (idCategoria === null || !(await one('SELECT 1 FROM categorias WHERE id = $1', [idCategoria]))) {
    throw HttpError.badRequest('Selecciona una categoría válida.');
  }
  if (idFamilia !== null && !(await one('SELECT 1 FROM familias WHERE id = $1 AND categoria_id = $2', [idFamilia, idCategoria]))) {
    throw HttpError.badRequest('La familia no pertenece a la categoría seleccionada.');
  }
  if (!['activo', 'inactivo'].includes(estado)) throw HttpError.badRequest('Estado no válido.');

  return { nombre, codigoBarras, precio, stock, descripcion: str(req, 'descripcion'), marca, color, idCategoria, idFamilia, activo: estado === 'activo' };
}

async function generateBarcode(): Promise<string> {
  for (;;) {
    const codigo = 'ML' + String(crypto.randomInt(1, 99_999_999_999)).padStart(11, '0');
    if (!(await one('SELECT 1 FROM productos WHERE codigo_barras = $1', [codigo]))) return codigo;
  }
}

async function assertBarcodeAvailable(codigo: string, exceptId = 0) {
  if (await one('SELECT 1 FROM productos WHERE codigo_barras = $1 AND id <> $2', [codigo, exceptId])) {
    throw HttpError.conflict('El código de barras ya está asignado a otro producto.');
  }
}

adminRouter.get('/products', async (_req, res) => {
  send(res, (await all(`${PRODUCT_SELECT} ORDER BY p.id DESC`)).map(formatAdminProduct));
});

adminRouter.post('/products', imageUpload, async (req, res) => {
  const d = await validatedProduct(req);
  const codigo = d.codigoBarras ?? (await generateBarcode());
  await assertBarcodeAvailable(codigo);

  const imagen = req.file ? await storeProductImage(req.file) : null;
  try {
    const id = await value<number>(
      `INSERT INTO productos (nombre, codigo_barras, categoria_id, familia_id, imagen, descripcion, marca, color, precio, stock, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [d.nombre, codigo, d.idCategoria, d.idFamilia, imagen, d.descripcion, d.marca, d.color, d.precio, d.stock, d.activo],
    );
    send(res, await findProduct(id!), 201);
  } catch (error) {
    await deleteProductImage(imagen);
    throw error;
  }
});

/** Se mantiene POST (no PUT) por compatibilidad con el frontend, que envía multipart/form-data. */
adminRouter.post('/products/:id', imageUpload, async (req, res) => {
  const id = idParam(req);
  const actual = await one('SELECT imagen FROM productos WHERE id = $1', [id]);
  if (!actual) throw HttpError.notFound('Producto no encontrado.');

  const d = await validatedProduct(req);
  const codigo = d.codigoBarras ?? (await generateBarcode());
  await assertBarcodeAvailable(codigo, id);

  const nueva = req.file ? await storeProductImage(req.file) : null;
  try {
    await exec(
      `UPDATE productos SET nombre = $1, codigo_barras = $2, categoria_id = $3, familia_id = $4, imagen = $5, descripcion = $6,
              marca = $7, color = $8, precio = $9, stock = $10, activo = $11
       WHERE id = $12`,
      [d.nombre, codigo, d.idCategoria, d.idFamilia, nueva ?? actual.imagen, d.descripcion, d.marca, d.color, d.precio, d.stock, d.activo, id],
    );
  } catch (error) {
    await deleteProductImage(nueva);
    throw error;
  }
  if (nueva) await deleteProductImage(actual.imagen);
  send(res, await findProduct(id));
});

/** Ajuste rápido de stock desde la tabla (valor absoluto). */
adminRouter.patch('/products/:id/stock', async (req, res) => {
  const id = idParam(req);
  const stock = int(req, 'stock');
  if (stock === null || stock < 0 || stock > 1_000_000) throw HttpError.badRequest('El stock debe ser un número entero entre 0 y 1.000.000.');
  if ((await exec('UPDATE productos SET stock = $1 WHERE id = $2', [stock, id])) === 0) throw HttpError.notFound('Producto no encontrado.');
  send(res, await findProduct(id));
});

/** Activa o desactiva varios productos a la vez. */
adminRouter.patch('/products/status', async (req, res) => {
  const estado = str(req, 'estado').toLowerCase();
  const ids = (req.body ?? {}).ids;
  if (!['activo', 'inactivo'].includes(estado)) throw HttpError.badRequest('Estado no válido.');
  if (!Array.isArray(ids) || !ids.length || ids.length > 500 || !ids.every((id) => Number.isInteger(id) && id > 0)) {
    throw HttpError.badRequest('Selecciona al menos un producto.');
  }
  const actualizados = await exec('UPDATE productos SET activo = $1 WHERE id = ANY($2::int[])', [estado === 'activo', ids]);
  send(res, { actualizados });
});

adminRouter.patch('/products/:id/status', async (req, res) => {
  const id = idParam(req);
  const estado = str(req, 'estado').toLowerCase();
  if (!['activo', 'inactivo'].includes(estado)) throw HttpError.badRequest('Estado no válido.');
  if ((await exec('UPDATE productos SET activo = $1 WHERE id = $2', [estado === 'activo', id])) === 0) {
    throw HttpError.notFound('Producto no encontrado.');
  }
  send(res, await findProduct(id));
});

// ---------------------------------------------------------------- Pedidos

const ORDER_STATES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const ADMIN_ORDER_SELECT = `
  SELECT p.id, p.total, p.estado, p.creado_en, p.metodo_pago, p.direccion_envio, p.telefono_contacto,
         p.nombre_contacto, p.correo_contacto, c.id AS cliente_id, c.nombre AS cliente, c.correo, c.rut,
         (SELECT coalesce(sum(i.cantidad), 0) FROM pedido_items i WHERE i.pedido_id = p.id) AS productos
  FROM pedidos p JOIN clientes c ON p.cliente_id = c.id`;

adminRouter.get('/orders', async (_req, res) => {
  const rows = await all(`${ADMIN_ORDER_SELECT} ORDER BY p.creado_en DESC, p.id DESC`);
  send(res, rows.map((r) => ({ ...formatOrder(r), cliente: r.cliente, idCliente: r.cliente_id, correo: r.correo })));
});

async function orderHistory(pedidoId: number) {
  return all(
    `SELECT h.id, h.estado, h.nota, h.creado_en AS fecha, a.usuario AS administrador
     FROM pedido_historial h LEFT JOIN administradores a ON a.id = h.administrador_id
     WHERE h.pedido_id = $1 ORDER BY h.creado_en, h.id`,
    [pedidoId],
  );
}

adminRouter.get('/orders/:id', async (req, res) => {
  const row = await one(`${ADMIN_ORDER_SELECT} WHERE p.id = $1`, [idParam(req)]);
  if (!row) throw HttpError.notFound('Pedido no encontrado.');
  send(res, {
    ...formatOrder(row),
    cliente: row.cliente,
    idCliente: row.cliente_id,
    correo: row.correo,
    rut: row.rut,
    nombreContacto: row.nombre_contacto,
    correoContacto: row.correo_contacto,
    items: await orderItems(row.id),
    historial: await orderHistory(row.id),
  });
});

/**
 * Cambia el estado de un pedido y lo registra en su historial, con una nota opcional.
 * Con `notificar`, avisa al cliente por correo (la nota se incluye en el correo).
 * Al cancelar se devuelve el stock; un pedido cancelado no se reactiva, porque su stock ya volvió al inventario.
 * Repetir el estado actual con una nota solo agrega la nota al historial.
 */
adminRouter.patch('/orders/:id/status', async (req, res) => {
  const adminId = requireAdmin(req);
  const id = idParam(req);
  const nuevo = str(req, 'estado');
  const nota = nullableStr(req, 'nota');
  const notificar = (req.body ?? {}).notificar === true;
  if (!ORDER_STATES.includes(nuevo)) throw HttpError.badRequest('Estado no válido.');
  if (nota && nota.length > 500) throw HttpError.badRequest('La nota no puede superar los 500 caracteres.');

  const cambio = await transaction(async (client) => {
    const pedido = await one('SELECT estado, nombre_contacto, correo_contacto FROM pedidos WHERE id = $1 FOR UPDATE', [id], client);
    if (!pedido) throw HttpError.notFound('Pedido no encontrado.');
    const actual: string = pedido.estado;
    if (actual === nuevo && !nota) return null;
    if (actual === 'cancelado' && nuevo !== 'cancelado') throw HttpError.conflict('Un pedido cancelado no se puede reactivar.');

    if (actual !== nuevo) {
      if (nuevo === 'cancelado') {
        await exec(
          `UPDATE productos p SET stock = p.stock + i.cantidad
           FROM pedido_items i WHERE i.producto_id = p.id AND i.pedido_id = $1`,
          [id],
          client,
        );
      }
      await exec('UPDATE pedidos SET estado = $1 WHERE id = $2', [nuevo, id], client);
    }
    await exec('INSERT INTO pedido_historial (pedido_id, estado, nota, administrador_id) VALUES ($1, $2, $3, $4)', [id, nuevo, nota, adminId], client);
    return pedido;
  });

  if (cambio && notificar) {
    sendMail(
      cambio.correo_contacto,
      `Pedido #${id}: ${nuevo} - Mundo Librería`,
      orderStatusTemplate(cambio.nombre_contacto, id, nuevo, nota, frontendUrl(req, `mis-pedidos/${id}`)),
    ).catch((error) => console.error('Error al enviar aviso de estado:', error));
  }

  send(res, { id, estado: nuevo, historial: await orderHistory(id) });
});

// ---------------------------------------------------------------- Clientes

const CUSTOMER_STATS = `
  (SELECT count(*) FROM pedidos p WHERE p.cliente_id = c.id) AS pedidos,
  (SELECT coalesce(sum(p.total), 0) FROM pedidos p WHERE p.cliente_id = c.id AND p.estado IN ('pagado', 'enviado', 'entregado')) AS total_gastado,
  (SELECT max(p.creado_en) FROM pedidos p WHERE p.cliente_id = c.id) AS ultimo_pedido`;

function formatCustomer(c: Row) {
  return {
    ...formatProfile(c),
    creadoEn: c.creado_en,
    pedidos: c.pedidos,
    totalGastado: c.total_gastado,
    ultimoPedido: c.ultimo_pedido,
  };
}

adminRouter.get('/users', async (_req, res) => {
  const rows = await all(`SELECT c.id, c.rut, c.nombre, c.correo, c.telefono, c.direccion, c.creado_en, ${CUSTOMER_STATS} FROM clientes c ORDER BY c.id DESC`);
  send(res, rows.map(formatCustomer));
});

/** Ficha del cliente: datos, totales y todos sus pedidos. */
adminRouter.get('/users/:id', async (req, res) => {
  const id = idParam(req);
  const cliente = await one(`SELECT c.id, c.rut, c.nombre, c.correo, c.telefono, c.direccion, c.creado_en, ${CUSTOMER_STATS} FROM clientes c WHERE c.id = $1`, [id]);
  if (!cliente) throw HttpError.notFound('Usuario no encontrado.');
  const pedidos = await all(
    `SELECT p.id, p.total, p.estado, p.creado_en, p.metodo_pago,
            (SELECT coalesce(sum(i.cantidad), 0) FROM pedido_items i WHERE i.pedido_id = p.id) AS productos
     FROM pedidos p WHERE p.cliente_id = $1 ORDER BY p.creado_en DESC, p.id DESC`,
    [id],
  );
  send(res, { ...formatCustomer(cliente), historialPedidos: pedidos.map(formatOrder) });
});

adminRouter.put('/users/:id', async (req, res) => {
  const id = idParam(req);
  const rut = str(req, 'rut');
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = str(req, 'telefono');
  const direccion = str(req, 'direccion');

  if (!rut || !nombre || !correo) throw HttpError.badRequest('RUT, nombre y correo son obligatorios.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (direccion.length > 255) throw HttpError.badRequest('La dirección no puede superar los 255 caracteres.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato del correo no es válido.');
  if (!isRut(rut)) throw HttpError.badRequest('El formato de RUT no es válido.');
  if (telefono && !isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');
  if (!(await one('SELECT 1 FROM clientes WHERE id = $1', [id]))) throw HttpError.notFound('Usuario no encontrado.');
  if (await one('SELECT 1 FROM clientes WHERE (lower(correo) = lower($1) OR rut = $2) AND id <> $3', [correo, rut, id])) {
    throw HttpError.conflict('El correo o el RUT ya pertenecen a otro usuario.');
  }

  const updated = await one(
    `UPDATE clientes SET rut = $1, nombre = $2, correo = $3, telefono = $4, direccion = $5 WHERE id = $6
     RETURNING id, rut, nombre, correo, telefono, direccion`,
    [rut, nombre, correo, telefono || null, direccion || null, id],
  );
  send(res, formatProfile(updated!));
});

/** No se eliminan clientes con pedidos: se perdería el historial de ventas (la base además lo impide). */
adminRouter.delete('/users/:id', async (req, res) => {
  const id = idParam(req);
  if (!(await one('SELECT 1 FROM clientes WHERE id = $1', [id]))) throw HttpError.notFound('Usuario no encontrado.');
  if (Number(await value('SELECT count(*) FROM pedidos WHERE cliente_id = $1', [id])) > 0) {
    throw HttpError.conflict('El usuario tiene pedidos registrados y no se puede eliminar.');
  }
  await exec('DELETE FROM clientes WHERE id = $1', [id]);
  send(res, { id });
});

// ---------------------------------------------------------------- Categorías

function validName(req: Request, label: string): string {
  const nombre = str(req, 'nombre');
  if (!nombre) throw HttpError.badRequest(`El nombre de la ${label} es obligatorio.`);
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  return nombre;
}

adminRouter.get('/categories', async (_req, res) => {
  const rows = await all(
    `SELECT c.id, c.nombre, c.creado_en AS "fechaCreacion",
            (SELECT count(*) FROM productos p WHERE p.categoria_id = c.id) AS productos,
            (SELECT count(*) FROM familias f WHERE f.categoria_id = c.id) AS familias
     FROM categorias c ORDER BY c.nombre`,
  );
  send(res, rows);
});

adminRouter.post('/categories', async (req, res) => {
  const nombre = validName(req, 'categoría');
  if (await one('SELECT 1 FROM categorias WHERE lower(nombre) = lower($1)', [nombre])) throw HttpError.conflict('La categoría ya existe.');
  send(res, await one('INSERT INTO categorias (nombre) VALUES ($1) RETURNING id, nombre', [nombre]), 201);
});

adminRouter.put('/categories/:id', async (req, res) => {
  const id = idParam(req);
  const nombre = validName(req, 'categoría');
  if (await one('SELECT 1 FROM categorias WHERE lower(nombre) = lower($1) AND id <> $2', [nombre, id])) {
    throw HttpError.conflict('Ya existe otra categoría con ese nombre.');
  }
  if ((await exec('UPDATE categorias SET nombre = $1 WHERE id = $2', [nombre, id])) === 0) throw HttpError.notFound('Categoría no encontrada.');
  send(res, { id, nombre });
});

/** Al eliminarla, sus familias se borran y sus productos quedan sin categoría (claves foráneas). */
adminRouter.delete('/categories/:id', async (req, res) => {
  const id = idParam(req);
  if ((await exec('DELETE FROM categorias WHERE id = $1', [id])) === 0) throw HttpError.notFound('Categoría no encontrada.');
  send(res, { id });
});

// ---------------------------------------------------------------- Familias

async function validatedFamily(req: Request): Promise<[string, number]> {
  const nombre = str(req, 'nombre');
  const idCategoria = positiveInt(req, 'idCategoria');
  if (!nombre || idCategoria === null) throw HttpError.badRequest('El nombre y la categoría son obligatorios.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (!(await one('SELECT 1 FROM categorias WHERE id = $1', [idCategoria]))) throw HttpError.badRequest('La categoría seleccionada no existe.');
  return [nombre, idCategoria];
}

adminRouter.get('/families', async (_req, res) => {
  const rows = await all(
    `SELECT f.id, f.nombre, f.categoria_id AS "idCategoria", c.nombre AS categoria,
            (SELECT count(*) FROM productos p WHERE p.familia_id = f.id) AS productos
     FROM familias f JOIN categorias c ON f.categoria_id = c.id
     ORDER BY c.nombre, f.nombre`,
  );
  send(res, rows);
});

adminRouter.post('/families', async (req, res) => {
  const [nombre, idCategoria] = await validatedFamily(req);
  if (await one('SELECT 1 FROM familias WHERE lower(nombre) = lower($1) AND categoria_id = $2', [nombre, idCategoria])) {
    throw HttpError.conflict('Ya existe una familia con ese nombre en esta categoría.');
  }
  send(res, await one('INSERT INTO familias (nombre, categoria_id) VALUES ($1, $2) RETURNING id', [nombre, idCategoria]), 201);
});

adminRouter.put('/families/:id', async (req, res) => {
  const id = idParam(req);
  const [nombre, idCategoria] = await validatedFamily(req);
  if (await one('SELECT 1 FROM familias WHERE lower(nombre) = lower($1) AND categoria_id = $2 AND id <> $3', [nombre, idCategoria, id])) {
    throw HttpError.conflict('Ya existe una familia con ese nombre en esta categoría.');
  }
  await transaction(async (client) => {
    if ((await exec('UPDATE familias SET nombre = $1, categoria_id = $2 WHERE id = $3', [nombre, idCategoria, id], client)) === 0) {
      throw HttpError.notFound('Familia no encontrada.');
    }
    // Los productos de la familia pasan a la nueva categoría para que no queden inconsistentes.
    await exec('UPDATE productos SET categoria_id = $1 WHERE familia_id = $2', [idCategoria, id], client);
  });
  send(res, { id });
});

/** Al eliminarla, sus productos quedan sin familia (clave foránea ON DELETE SET NULL). */
adminRouter.delete('/families/:id', async (req, res) => {
  const id = idParam(req);
  if ((await exec('DELETE FROM familias WHERE id = $1', [id])) === 0) throw HttpError.notFound('Familia no encontrada.');
  send(res, { id });
});

// ---------------------------------------------------------------- Administradores

adminRouter.get('/admins', async (_req, res) => {
  send(res, await all('SELECT id, usuario AS nombre FROM administradores ORDER BY usuario'));
});

adminRouter.post('/admins', async (req, res) => {
  const nombre = str(req, 'nombre');
  const password = rawString(req, 'password');
  if (!nombre || !password) throw HttpError.badRequest('El nombre y la contraseña son obligatorios.');
  if (nombre.length > 50) throw HttpError.badRequest('El nombre no puede superar los 50 caracteres.');
  // Clientes y administradores comparten el formulario de inicio de sesión: los correos son de clientes.
  if (nombre.includes('@')) throw HttpError.badRequest('El usuario de administrador no puede ser un correo (no uses "@").');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);
  if (await one('SELECT 1 FROM administradores WHERE lower(usuario) = lower($1)', [nombre])) {
    throw HttpError.conflict('Ya existe un administrador con ese nombre.');
  }

  const admin = await one('INSERT INTO administradores (usuario, password_hash) VALUES ($1, $2) RETURNING id, usuario AS nombre', [
    nombre,
    await hashPassword(password),
  ]);
  send(res, admin, 201);
});

adminRouter.delete('/admins/:id', async (req, res) => {
  const id = idParam(req);
  if (id === requireAdmin(req)) throw HttpError.conflict('No puedes eliminar tu propia cuenta de administrador.');
  await transaction(async (client) => {
    // Bloquear la tabla evita que dos borrados simultáneos dejen la tienda sin administradores.
    await client.query('LOCK TABLE administradores IN SHARE ROW EXCLUSIVE MODE');
    if (Number(await value('SELECT count(*) FROM administradores', [], client)) <= 1) {
      throw HttpError.conflict('Debe quedar al menos un administrador.');
    }
    if ((await exec('DELETE FROM administradores WHERE id = $1', [id], client)) === 0) {
      throw HttpError.notFound('Administrador no encontrado.');
    }
  });
  send(res, { id });
});
