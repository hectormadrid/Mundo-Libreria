import crypto from 'node:crypto';
import { Router, type Request } from 'express';
import { all, exec, insert, one, transaction, value, type Row } from '../db.js';
import { float, HttpError, idParam, int, nullableStr, positiveInt, rawString, send, str } from '../http.js';
import { hashPassword, requireAdmin } from '../auth.js';
import { isEmail, isPhone, isRut, isStrongPassword, PASSWORD_RULE } from '../validation.js';
import { deleteProductImage, imageUpload, storeProductImage } from '../uploads.js';
import { formatOrder, formatProfile, orderItems } from './account.js';

export const adminRouter = Router();

// Todas las rutas de este router requieren una sesión de administrador.
adminRouter.use((req, _res, next) => {
  requireAdmin(req);
  next();
});

// ---------------------------------------------------------------- Métricas

adminRouter.get('/metrics', async (_req, res) => {
  const [totalProductos, productosActivos, stockBajo, valorInventario, pedidosPendientes, ventasMes] = await Promise.all([
    value('SELECT COUNT(*) FROM productos'),
    value("SELECT COUNT(*) FROM productos WHERE estado = 'activo'"),
    value("SELECT COUNT(*) FROM productos WHERE stock < 10 AND estado = 'activo'"),
    value("SELECT COALESCE(SUM(precio * stock), 0) FROM productos WHERE estado = 'activo'"),
    value("SELECT COUNT(*) FROM pedido WHERE estado = 'pendiente'"),
    // Ventas confirmadas del mes: todo lo pagado, enviado o entregado.
    value(`SELECT COALESCE(SUM(total), 0) FROM pedido
           WHERE estado IN ('pagado', 'enviado', 'entregado')
             AND YEAR(fecha) = YEAR(CURRENT_DATE()) AND MONTH(fecha) = MONTH(CURRENT_DATE())`),
  ]);
  send(res, {
    totalProductos: Number(totalProductos),
    productosActivos: Number(productosActivos),
    stockBajo: Number(stockBajo),
    valorInventario: Number(valorInventario),
    pedidosPendientes: Number(pedidosPendientes),
    ventasMes: Number(ventasMes),
  });
});

// ---------------------------------------------------------------- Productos

const PRODUCT_SELECT = `
  SELECT p.id, p.nombre, p.codigo_barras, p.imagen, p.precio, p.descripcion, p.marca, p.color,
         p.stock, p.estado, p.fecha_creacion, p.id_categoria, c.nombre AS categoria,
         p.id_familia, f.nombre AS familia
  FROM productos p
  LEFT JOIN categorias c ON p.id_categoria = c.id
  LEFT JOIN familias f ON p.id_familia = f.id`;

function formatAdminProduct(p: Row) {
  return {
    id: p.id,
    nombre: p.nombre,
    codigoBarras: p.codigo_barras,
    imagen: p.imagen || null,
    precio: Number(p.precio),
    descripcion: p.descripcion ?? '',
    marca: p.marca,
    color: p.color,
    stock: p.stock,
    estado: String(p.estado).toLowerCase(),
    fechaCreacion: p.fecha_creacion,
    idCategoria: p.id_categoria,
    categoria: p.categoria,
    idFamilia: p.id_familia,
    familia: p.familia,
  };
}

async function findProduct(id: number) {
  return formatAdminProduct((await one(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]))!);
}

async function validatedProduct(req: Request) {
  const nombre = str(req, 'nombre');
  const precio = float(req, 'precio');
  const stock = int(req, 'stock');
  const idCategoria = positiveInt(req, 'idCategoria');
  const idFamilia = positiveInt(req, 'idFamilia');
  const estado = (str(req, 'estado') || 'activo').toLowerCase();

  if (!nombre) throw HttpError.badRequest('El nombre es obligatorio.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (precio === null || precio < 0) throw HttpError.badRequest('El precio debe ser un número mayor o igual a 0.');
  if (stock === null || stock < 0) throw HttpError.badRequest('El stock debe ser un número entero mayor o igual a 0.');
  if (idCategoria === null || !(await one('SELECT id FROM categorias WHERE id = ?', [idCategoria]))) {
    throw HttpError.badRequest('Selecciona una categoría válida.');
  }
  if (idFamilia !== null && !(await one('SELECT id FROM familias WHERE id = ? AND id_categoria = ?', [idFamilia, idCategoria]))) {
    throw HttpError.badRequest('La familia no pertenece a la categoría seleccionada.');
  }
  if (!['activo', 'inactivo'].includes(estado)) throw HttpError.badRequest('Estado no válido.');

  return {
    nombre,
    codigoBarras: nullableStr(req, 'codigoBarras'),
    precio,
    stock,
    descripcion: str(req, 'descripcion'),
    marca: nullableStr(req, 'marca'),
    color: nullableStr(req, 'color'),
    idCategoria,
    idFamilia,
    estado,
  };
}

async function generateBarcode(): Promise<string> {
  for (;;) {
    const codigo = 'ML' + String(crypto.randomInt(1, 99_999_999_999)).padStart(11, '0');
    if (!(await one('SELECT id FROM productos WHERE codigo_barras = ?', [codigo]))) return codigo;
  }
}

async function assertBarcodeAvailable(codigo: string, exceptId = 0) {
  if (await one('SELECT id FROM productos WHERE codigo_barras = ? AND id != ?', [codigo, exceptId])) {
    throw HttpError.conflict('El código de barras ya está asignado a otro producto.');
  }
}

adminRouter.get('/products', async (_req, res) => {
  send(res, (await all(`${PRODUCT_SELECT} ORDER BY p.id DESC`)).map(formatAdminProduct));
});

adminRouter.post('/products', imageUpload, async (req, res) => {
  const data = await validatedProduct(req);
  const codigo = data.codigoBarras ?? (await generateBarcode());
  await assertBarcodeAvailable(codigo);

  const imagen = req.file ? await storeProductImage(req.file) : null;
  try {
    const id = await insert(
      `INSERT INTO productos (nombre, codigo_barras, id_categoria, id_familia, imagen, descripcion, marca, color, precio, stock, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.nombre, codigo, data.idCategoria, data.idFamilia, imagen, data.descripcion, data.marca, data.color, data.precio, data.stock, data.estado],
    );
    send(res, await findProduct(id), 201);
  } catch (error) {
    await deleteProductImage(imagen);
    throw error;
  }
});

/** Se mantiene POST (no PUT) por compatibilidad con el frontend, que envía multipart/form-data. */
adminRouter.post('/products/:id', imageUpload, async (req, res) => {
  const id = idParam(req);
  const actual = await one('SELECT imagen FROM productos WHERE id = ?', [id]);
  if (!actual) throw HttpError.notFound('Producto no encontrado.');

  const data = await validatedProduct(req);
  const codigo = data.codigoBarras ?? (await generateBarcode());
  await assertBarcodeAvailable(codigo, id);

  const nueva = req.file ? await storeProductImage(req.file) : null;
  try {
    await exec(
      `UPDATE productos SET nombre = ?, codigo_barras = ?, id_categoria = ?, id_familia = ?, imagen = ?, descripcion = ?,
              marca = ?, color = ?, precio = ?, stock = ?, estado = ?
       WHERE id = ?`,
      [data.nombre, codigo, data.idCategoria, data.idFamilia, nueva ?? actual.imagen, data.descripcion, data.marca, data.color, data.precio, data.stock, data.estado, id],
    );
  } catch (error) {
    await deleteProductImage(nueva);
    throw error;
  }
  if (nueva) await deleteProductImage(actual.imagen);
  send(res, await findProduct(id));
});

adminRouter.patch('/products/:id/status', async (req, res) => {
  const id = idParam(req);
  const estado = str(req, 'estado').toLowerCase();
  if (!['activo', 'inactivo'].includes(estado)) throw HttpError.badRequest('Estado no válido.');
  if (!(await one('SELECT id FROM productos WHERE id = ?', [id]))) throw HttpError.notFound('Producto no encontrado.');
  await exec('UPDATE productos SET estado = ? WHERE id = ?', [estado, id]);
  send(res, await findProduct(id));
});

// ---------------------------------------------------------------- Pedidos

const ORDER_STATES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const ADMIN_ORDER_SELECT = `
  SELECT p.id, p.total, p.estado, p.fecha, p.metodo_pago, p.direccion_envio, p.telefono_contacto,
         u.nombre AS cliente, u.correo, u.rut
  FROM pedido p JOIN usuario u ON p.id_usuario = u.id`;

adminRouter.get('/orders', async (_req, res) => {
  const rows = await all(`${ADMIN_ORDER_SELECT} ORDER BY p.fecha DESC, p.id DESC`);
  send(res, rows.map((r) => ({ ...formatOrder(r), cliente: r.cliente, correo: r.correo })));
});

adminRouter.get('/orders/:id', async (req, res) => {
  const row = await one(`${ADMIN_ORDER_SELECT} WHERE p.id = ?`, [idParam(req)]);
  if (!row) throw HttpError.notFound('Pedido no encontrado.');
  send(res, { ...formatOrder(row), cliente: row.cliente, correo: row.correo, rut: row.rut, items: await orderItems(row.id) });
});

/**
 * Al cancelar un pedido se devuelve el stock de sus productos.
 * Un pedido cancelado no se reactiva, porque su stock ya volvió al inventario.
 */
adminRouter.patch('/orders/:id/status', async (req, res) => {
  const id = idParam(req);
  const nuevo = str(req, 'estado');
  if (!ORDER_STATES.includes(nuevo)) throw HttpError.badRequest('Estado no válido.');

  await transaction(async (conn) => {
    const actual = await value<string>('SELECT estado FROM pedido WHERE id = ? FOR UPDATE', [id], conn);
    if (actual === null) throw HttpError.notFound('Pedido no encontrado.');
    if (actual === nuevo) return;
    if (actual === 'cancelado') throw HttpError.conflict('Un pedido cancelado no se puede reactivar.');
    if (nuevo === 'cancelado') {
      await exec(
        `UPDATE productos p JOIN detalle_pedido d ON d.id_producto = p.id
         SET p.stock = p.stock + d.cantidad WHERE d.id_pedido = ?`,
        [id],
        conn,
      );
    }
    await exec('UPDATE pedido SET estado = ? WHERE id = ?', [nuevo, id], conn);
  });

  send(res, { id, estado: nuevo });
});

// ---------------------------------------------------------------- Clientes

adminRouter.get('/users', async (_req, res) => {
  const rows = await all(
    `SELECT u.id, u.rut, u.nombre, u.correo, u.telefono, u.direccion,
            (SELECT COUNT(*) FROM pedido p WHERE p.id_usuario = u.id) AS pedidos
     FROM usuario u ORDER BY u.id DESC`,
  );
  send(res, rows.map((u) => ({ ...formatProfile(u), pedidos: Number(u.pedidos) })));
});

adminRouter.put('/users/:id', async (req, res) => {
  const id = idParam(req);
  const rut = str(req, 'rut');
  const nombre = str(req, 'nombre');
  const correo = str(req, 'correo');
  const telefono = str(req, 'telefono');
  const direccion = str(req, 'direccion');

  if (!rut || !nombre || !correo) throw HttpError.badRequest('RUT, nombre y correo son obligatorios.');
  if (nombre.length > 50) throw HttpError.badRequest('El nombre no puede superar los 50 caracteres.');
  if (!isEmail(correo)) throw HttpError.badRequest('El formato del correo no es válido.');
  if (!isRut(rut)) throw HttpError.badRequest('El formato de RUT no es válido.');
  if (telefono && !isPhone(telefono)) throw HttpError.badRequest('El formato de teléfono no es válido.');
  if (!(await one('SELECT id FROM usuario WHERE id = ?', [id]))) throw HttpError.notFound('Usuario no encontrado.');
  if (await one('SELECT id FROM usuario WHERE (correo = ? OR rut = ?) AND id != ?', [correo, rut, id])) {
    throw HttpError.conflict('El correo o el RUT ya pertenecen a otro usuario.');
  }

  await exec('UPDATE usuario SET rut = ?, nombre = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ?', [
    rut,
    nombre,
    correo,
    telefono || null,
    direccion || null,
    id,
  ]);
  send(res, formatProfile((await one('SELECT id, rut, nombre, correo, telefono, direccion FROM usuario WHERE id = ?', [id]))!));
});

/** No se eliminan clientes con pedidos: la base de datos borraría también su historial de ventas. */
adminRouter.delete('/users/:id', async (req, res) => {
  const id = idParam(req);
  if (!(await one('SELECT id FROM usuario WHERE id = ?', [id]))) throw HttpError.notFound('Usuario no encontrado.');
  if (Number(await value('SELECT COUNT(*) FROM pedido WHERE id_usuario = ?', [id])) > 0) {
    throw HttpError.conflict('El usuario tiene pedidos registrados y no se puede eliminar.');
  }
  await exec('DELETE FROM usuario WHERE id = ?', [id]);
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
    `SELECT c.id, c.nombre, c.fecha_creacion,
            (SELECT COUNT(*) FROM productos p WHERE p.id_categoria = c.id) AS productos,
            (SELECT COUNT(*) FROM familias f WHERE f.id_categoria = c.id) AS familias
     FROM categorias c ORDER BY c.nombre ASC`,
  );
  send(res, rows.map((c) => ({ id: c.id, nombre: c.nombre, fechaCreacion: c.fecha_creacion, productos: Number(c.productos), familias: Number(c.familias) })));
});

adminRouter.post('/categories', async (req, res) => {
  const nombre = validName(req, 'categoría');
  if (await one('SELECT id FROM categorias WHERE nombre = ?', [nombre])) throw HttpError.conflict('La categoría ya existe.');
  send(res, { id: await insert('INSERT INTO categorias (nombre) VALUES (?)', [nombre]), nombre }, 201);
});

adminRouter.put('/categories/:id', async (req, res) => {
  const id = idParam(req);
  const nombre = validName(req, 'categoría');
  if (!(await one('SELECT id FROM categorias WHERE id = ?', [id]))) throw HttpError.notFound('Categoría no encontrada.');
  if (await one('SELECT id FROM categorias WHERE nombre = ? AND id != ?', [nombre, id])) {
    throw HttpError.conflict('Ya existe otra categoría con ese nombre.');
  }
  await exec('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
  send(res, { id, nombre });
});

/** Al eliminarla, sus familias se borran y sus productos quedan sin categoría (claves foráneas). */
adminRouter.delete('/categories/:id', async (req, res) => {
  const id = idParam(req);
  if ((await exec('DELETE FROM categorias WHERE id = ?', [id])) === 0) throw HttpError.notFound('Categoría no encontrada.');
  send(res, { id });
});

// ---------------------------------------------------------------- Familias

async function validatedFamily(req: Request): Promise<[string, number]> {
  const nombre = str(req, 'nombre');
  const idCategoria = positiveInt(req, 'idCategoria');
  if (!nombre || idCategoria === null) throw HttpError.badRequest('El nombre y la categoría son obligatorios.');
  if (nombre.length > 100) throw HttpError.badRequest('El nombre no puede superar los 100 caracteres.');
  if (!(await one('SELECT id FROM categorias WHERE id = ?', [idCategoria]))) throw HttpError.badRequest('La categoría seleccionada no existe.');
  return [nombre, idCategoria];
}

adminRouter.get('/families', async (_req, res) => {
  const rows = await all(
    `SELECT f.id, f.nombre, f.id_categoria, c.nombre AS categoria,
            (SELECT COUNT(*) FROM productos p WHERE p.id_familia = f.id) AS productos
     FROM familias f JOIN categorias c ON f.id_categoria = c.id
     ORDER BY c.nombre ASC, f.nombre ASC`,
  );
  send(res, rows.map((f) => ({ id: f.id, nombre: f.nombre, idCategoria: f.id_categoria, categoria: f.categoria, productos: Number(f.productos) })));
});

adminRouter.post('/families', async (req, res) => {
  const [nombre, idCategoria] = await validatedFamily(req);
  if (await one('SELECT id FROM familias WHERE nombre = ? AND id_categoria = ?', [nombre, idCategoria])) {
    throw HttpError.conflict('Ya existe una familia con ese nombre en esta categoría.');
  }
  send(res, { id: await insert('INSERT INTO familias (nombre, id_categoria) VALUES (?, ?)', [nombre, idCategoria]) }, 201);
});

adminRouter.put('/families/:id', async (req, res) => {
  const id = idParam(req);
  const [nombre, idCategoria] = await validatedFamily(req);
  if (!(await one('SELECT id FROM familias WHERE id = ?', [id]))) throw HttpError.notFound('Familia no encontrada.');
  if (await one('SELECT id FROM familias WHERE nombre = ? AND id_categoria = ? AND id != ?', [nombre, idCategoria, id])) {
    throw HttpError.conflict('Ya existe una familia con ese nombre en esta categoría.');
  }
  await transaction(async (conn) => {
    await exec('UPDATE familias SET nombre = ?, id_categoria = ? WHERE id = ?', [nombre, idCategoria, id], conn);
    // Los productos de la familia pasan a la nueva categoría para que no queden inconsistentes.
    await exec('UPDATE productos SET id_categoria = ? WHERE id_familia = ?', [idCategoria, id], conn);
  });
  send(res, { id });
});

/** Al eliminarla, sus productos quedan sin familia (clave foránea ON DELETE SET NULL). */
adminRouter.delete('/families/:id', async (req, res) => {
  const id = idParam(req);
  if ((await exec('DELETE FROM familias WHERE id = ?', [id])) === 0) throw HttpError.notFound('Familia no encontrada.');
  send(res, { id });
});

// ---------------------------------------------------------------- Administradores

adminRouter.get('/admins', async (_req, res) => {
  send(res, await all('SELECT id, nombre FROM Administrador ORDER BY nombre ASC'));
});

adminRouter.post('/admins', async (req, res) => {
  const nombre = str(req, 'nombre');
  const password = rawString(req, 'password');
  if (!nombre || !password) throw HttpError.badRequest('El nombre y la contraseña son obligatorios.');
  if (nombre.length > 50) throw HttpError.badRequest('El nombre no puede superar los 50 caracteres.');
  if (!isStrongPassword(password)) throw HttpError.badRequest(PASSWORD_RULE);
  if (await one('SELECT id FROM Administrador WHERE nombre = ?', [nombre])) throw HttpError.conflict('Ya existe un administrador con ese nombre.');

  const id = await insert("INSERT INTO Administrador (nombre, tipo, password) VALUES (?, 'administrador', ?)", [nombre, await hashPassword(password)]);
  send(res, { id, nombre }, 201);
});

adminRouter.delete('/admins/:id', async (req, res) => {
  const id = idParam(req);
  if (id === requireAdmin(req)) throw HttpError.conflict('No puedes eliminar tu propia cuenta de administrador.');
  if (Number(await value('SELECT COUNT(*) FROM Administrador')) <= 1) throw HttpError.conflict('Debe quedar al menos un administrador.');
  if ((await exec('DELETE FROM Administrador WHERE id = ?', [id])) === 0) throw HttpError.notFound('Administrador no encontrado.');
  send(res, { id });
});
