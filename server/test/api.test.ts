import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Server } from 'node:http';
import { after, before, describe, test } from 'node:test';
import { baseUrl, Client, mailLog, PNG, startDatabase, stopDatabase, uploadsDir, waitForMail } from './helpers.js';

let server: Server;
let base: string;
let db: typeof import('../src/db.js');
let resetThrottle: () => void;
let app: import("express").Express;

const NEW_USER = { rut: '12.345.678-5', nombre: "Ana O'Higgins <b>", correo: 'ana@test.cl', telefono: '+56912345678', password: 'Clave123!' };

async function loggedUser(): Promise<Client> {
  const c = await new Client(base).start();
  const res = await c.post('/api/auth/login', { correo: NEW_USER.correo, password: NEW_USER.password });
  assert.equal(res.status, 200, res.text);
  return c;
}

async function loggedAdmin(): Promise<Client> {
  const c = await new Client(base).start();
  const res = await c.post('/api/auth/login', { correo: 'testadmin', password: 'Admin123!' });
  assert.equal(res.status, 200, res.text);
  return c;
}

before(async () => {
  await startDatabase();
  // Importar después de configurar las variables de entorno de prueba.
  const { createApp } = await import('../src/app.js');
  db = await import('../src/db.js');
  ({ resetThrottle } = await import('../src/throttle.js'));

  // Las columnas identity asignan 1, 2, 3... en orden de inserción.
  await db.exec("INSERT INTO categorias (nombre) VALUES ('Libreria'), ('Oficina'), ('Papeleria')");
  await db.exec("INSERT INTO familias (nombre, categoria_id) VALUES ('Lápices', 1), ('Calculadoras', 2)");
  await db.exec(
    `INSERT INTO productos (nombre, codigo_barras, categoria_id, familia_id, precio, stock, activo, descripcion) VALUES
     ('Lápiz pasta azul', 'ML00000000001', 1, 1, 790, 20, true, 'Lápiz de tinta'),
     ('Calculadora', 'ML00000000002', 2, 2, 2500, 3, true, 'Calculadora básica'),
     ('Producto oculto', 'ML00000000003', 1, NULL, 100, 5, false, '')`,
  );
  for (let i = 0; i < 13; i++) {
    await db.exec('INSERT INTO productos (nombre, categoria_id, precio, stock) VALUES ($1, 3, 100, 1)', [`Papel ${i}`]);
  }

  app = createApp();
  server = app.listen(0);
  // fetch reutiliza conexiones; con el límite de 5 s de Node, una pausa larga entre
  // peticiones puede encontrar el socket recién cerrado (ECONNRESET).
  server.keepAliveTimeout = 60_000;
  base = baseUrl(server);
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  app.locals.sessionStore.close();
  await db.pool.end();
  await stopDatabase();
});

describe('sesión y seguridad', () => {
  test('entrega un token CSRF y rechaza peticiones sin él', async () => {
    const c = new Client(base);
    const session = await c.get('/api/auth/session');
    assert.equal(session.status, 200);
    assert.match(session.body.data.csrfToken, /^[a-f0-9]{64}$/);
    assert.equal(session.body.data.user, null);

    const sinToken = await c.post('/api/auth/login', { correo: 'x@x.cl', password: 'x' }, { csrf: false });
    assert.equal(sinToken.status, 403);
  });

  test('rutas desconocidas de la API devuelven 404 JSON y el resto sirve la app React', async () => {
    const c = new Client(base);
    const api = await c.get('/api/no-existe');
    assert.equal(api.status, 404);
    assert.equal(api.body.error, 'Ruta no encontrada.');

    const page = await c.get('/admin/pedidos');
    assert.equal(page.status, 200);
    assert.match(page.text, /App React/);
  });
});

describe('registro e inicio de sesión', () => {
  test('valida contraseña, RUT y duplicados', async () => {
    const c = await new Client(base).start();
    assert.equal((await c.post('/api/auth/register', { ...NEW_USER, password: 'debil' })).status, 400);
    assert.equal((await c.post('/api/auth/register', { ...NEW_USER, rut: '12.345.678-4' })).status, 400);

    const ok = await c.post('/api/auth/register', NEW_USER);
    assert.equal(ok.status, 201, ok.text);
    assert.equal((await c.post('/api/auth/register', NEW_USER)).status, 409);

    // El RUT se guarda completo (antes VARCHAR(10) cortaba el dígito verificador) y el texto sin codificar.
    const row = await db.one('SELECT rut, nombre FROM clientes WHERE correo = $1', [NEW_USER.correo]);
    assert.deepEqual({ ...row }, { rut: NEW_USER.rut, nombre: NEW_USER.nombre });
    await waitForMail(/Bienvenido, Ana O&#039;Higgins &lt;b&gt;/);
  });

  test('inicia sesión y bloquea tras 5 intentos fallidos', async () => {
    const c = await new Client(base).start();
    assert.equal((await c.post('/api/auth/login', { correo: NEW_USER.correo, password: 'mala' })).status, 401);

    const ok = await c.post('/api/auth/login', { correo: NEW_USER.correo, password: NEW_USER.password });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.user.nombre, NEW_USER.nombre);

    const otro = await new Client(base).start();
    for (let i = 0; i < 5; i++) assert.equal((await otro.post('/api/auth/login', { correo: 'nadie@x.cl', password: 'x' })).status, 401);
    assert.equal((await otro.post('/api/auth/login', { correo: 'nadie@x.cl', password: 'x' })).status, 429);
    resetThrottle();
  });

  test('cerrar sesión entrega una sesión nueva', async () => {
    const c = await loggedUser();
    const before = c.csrf;
    const out = await c.post('/api/auth/logout');
    assert.equal(out.status, 200);
    assert.notEqual(c.csrf, before);
    assert.equal((await c.get('/api/profile')).status, 401);
  });
});

describe('catálogo', () => {
  test('lista solo productos activos con stock, paginados de a 12', async () => {
    const c = new Client(base);
    const page1 = await c.get('/api/products');
    assert.equal(page1.body.data.total, 15);
    assert.equal(page1.body.data.items.length, 12);
    assert.equal(page1.body.data.pages, 2);
    assert.ok(!page1.body.data.items.some((p: { nombre: string }) => p.nombre === 'Producto oculto'));
    assert.equal((await c.get('/api/products?page=2')).body.data.items.length, 3);
  });

  test('filtra por categoría, familia y búsqueda', async () => {
    const c = new Client(base);
    assert.equal((await c.get('/api/products?categoria=oficina')).body.data.total, 1);
    assert.equal((await c.get('/api/products?categoria=libreria&familia=1')).body.data.items[0].nombre, 'Lápiz pasta azul');
    assert.equal((await c.get('/api/products?q=tinta')).body.data.total, 1);
    assert.deepEqual((await c.get('/api/families?categoria=Libreria')).body.data, [{ id: 1, nombre: 'Lápices' }]);
    assert.equal((await c.get('/api/categories')).body.data.length, 3);
  });

  test('detalle de producto, oculto o inexistente', async () => {
    const c = new Client(base);
    const detail = await c.get('/api/products/1');
    assert.equal(detail.body.data.familia, 'Lápices');
    assert.equal(detail.body.data.precio, 790);
    assert.equal((await c.get('/api/products/3')).status, 404);
    assert.equal((await c.get('/api/products/abc')).status, 400);
  });
});

describe('carrito y compra', () => {
  test('el carrito requiere sesión y respeta el stock', async () => {
    const anon = await new Client(base).start();
    assert.deepEqual((await anon.get('/api/cart')).body.data, { items: [], total: 0, count: 0 });
    assert.equal((await anon.post('/api/cart/items', { productId: 1 })).status, 401);

    const c = await loggedUser();
    assert.equal((await c.post('/api/cart/items', { productId: 3 })).status, 404);
    assert.equal((await c.post('/api/cart/items', { productId: 2, cantidad: 4 })).status, 409);

    const added = await c.post('/api/cart/items', { productId: 2, cantidad: 2 });
    assert.equal(added.body.data.count, 2);
    assert.equal(added.body.data.total, 5000);
    assert.equal((await c.patch('/api/cart/items/2', { cantidad: 4 })).status, 409);
    assert.equal((await c.patch('/api/cart/items/2', { cantidad: 3 })).body.data.count, 3);
    assert.equal((await c.patch('/api/cart/items/1', { cantidad: 1 })).status, 404);
    assert.equal((await c.delete('/api/cart/items/2')).body.data.count, 0);
  });

  test('crea el pedido, descuenta stock y vacía el carrito', async () => {
    const c = await loggedUser();
    const order = { nombre: 'Ana', correo: NEW_USER.correo, telefono: '+56911112222', direccion: 'Calle 1 #23', metodoPago: 'transferencia' };
    assert.equal((await c.post('/api/orders', order)).status, 400, 'carrito vacío');

    await c.post('/api/cart/items', { productId: 2, cantidad: 2 });
    await c.post('/api/cart/items', { productId: 1, cantidad: 1 });
    assert.equal((await c.post('/api/orders', { ...order, metodoPago: 'bitcoin' })).status, 400);

    const created = await c.post('/api/orders', order);
    assert.equal(created.status, 201, created.text);
    const id = created.body.data.id;

    assert.equal((await c.get('/api/cart')).body.data.count, 0);
    assert.equal(await db.value('SELECT stock FROM productos WHERE id = 2'), 1);

    const detail = await c.get(`/api/orders/${id}`);
    assert.equal(detail.body.data.estado, 'pendiente');
    assert.equal(detail.body.data.total, 5790);
    assert.equal(detail.body.data.direccionEnvio, 'Calle 1 #23');
    assert.equal(detail.body.data.items.length, 2);

    const list = await c.get('/api/orders');
    assert.equal(list.body.data[0].productos, 3);
    await waitForMail(new RegExp(`Orden #${id}\\b`));
  });

  test('la tarjeta (simulada) deja el pedido pagado y no se ven pedidos ajenos', async () => {
    const c = await loggedUser();
    await c.post('/api/cart/items', { productId: 1, cantidad: 1 });
    const created = await c.post('/api/orders', { nombre: 'Ana', correo: NEW_USER.correo, metodoPago: 'tarjeta' });
    assert.equal((await c.get(`/api/orders/${created.body.data.id}`)).body.data.estado, 'pagado');

    const otro = await new Client(base).start();
    await otro.post('/api/auth/register', { ...NEW_USER, rut: '11.111.111-1', correo: 'otro@test.cl' });
    await otro.post('/api/auth/login', { correo: 'otro@test.cl', password: NEW_USER.password });
    assert.equal((await otro.get(`/api/orders/${created.body.data.id}`)).status, 404);
  });

  test('actualiza el perfil', async () => {
    const c = await loggedUser();
    assert.equal((await c.put('/api/profile', { nombre: 'Ana', telefono: 'abc' })).status, 400);
    const ok = await c.put('/api/profile', { nombre: "Ana O'Higgins <b>", telefono: '+56999998888', direccion: 'Nueva 1' });
    assert.equal(ok.body.data.direccion, 'Nueva 1');
  });
});

describe('recuperar contraseña', () => {
  test('el enlace funciona una sola vez', async () => {
    const c = await new Client(base).start();
    assert.equal((await c.post('/api/auth/forgot-password', { correo: 'noexiste@x.cl' })).status, 200);
    assert.equal((await c.post('/api/auth/forgot-password', { correo: NEW_USER.correo })).status, 200);

    const token = [...mailLog().matchAll(/http:\/\/tienda\.test\/restablecer\?token=([a-f0-9]{64})/g)].pop()?.[1];
    assert.ok(token, 'el correo incluye el enlace con APP_URL');

    assert.equal((await c.post('/api/auth/reset-password/validate', { token })).status, 200);
    assert.equal((await c.post('/api/auth/reset-password', { token, password: 'debil' })).status, 400);
    assert.equal((await c.post('/api/auth/reset-password', { token, password: 'Nueva123!' })).status, 200);
    assert.equal((await c.post('/api/auth/reset-password/validate', { token })).status, 400);

    assert.equal((await c.post('/api/auth/login', { correo: NEW_USER.correo, password: 'Nueva123!' })).status, 200);
    NEW_USER.password = 'Nueva123!';
  });
});

describe('panel de administración', () => {
  test('el mismo login sirve para clientes y administradores', async () => {
    const c = await new Client(base).start();
    const admin = await c.post('/api/auth/login', { correo: 'TestAdmin', password: 'Admin123!' });
    assert.equal(admin.status, 200);
    assert.equal(admin.body.data.admin.nombre, 'testadmin');
    assert.equal(admin.body.data.user, null);

    const cliente = await c.post('/api/auth/login', { correo: NEW_USER.correo, password: NEW_USER.password });
    assert.equal(cliente.body.data.admin, null, 'entrar como cliente cierra la sesión de admin');
    assert.equal(cliente.body.data.user.correo, NEW_USER.correo);

    assert.equal((await c.post('/api/auth/login', { correo: 'testadmin', password: 'mala' })).status, 401);
    // Ya no hay un login separado; sin sesión de admin, todo /api/admin responde 403.
    assert.equal((await c.post('/api/admin/auth/login', { nombre: 'testadmin', password: 'Admin123!' })).status, 403);

    // Un usuario de administrador no puede parecer un correo (se confundiría con un cliente).
    const panel = await loggedAdmin();
    assert.equal((await panel.post('/api/admin/admins', { nombre: 'jefe@tienda.cl', password: 'Jefe1234!' })).status, 400);
  });

  test('acepta contraseñas creadas por PHP y bloquea a los clientes', async () => {
    const admin = await loggedAdmin();
    assert.equal(admin.csrf.length, 64);
    assert.equal((await new Client(base).get('/api/admin/metrics')).status, 403);
    assert.equal((await (await loggedUser()).get('/api/admin/metrics')).status, 403);
    // Iniciar sesión como cliente cierra la sesión de admin en ese navegador.
    await admin.post('/api/auth/login', { correo: NEW_USER.correo, password: NEW_USER.password });
    assert.equal((await admin.get('/api/admin/metrics')).status, 403);
  });

  test('dashboard: indicadores, gráfico, ranking y alertas', async () => {
    const admin = await loggedAdmin();
    assert.equal((await (await loggedUser()).get('/api/admin/dashboard')).status, 403);
    assert.equal((await admin.get('/api/admin/dashboard?dias=3')).status, 400);

    // Hasta aquí: un pedido por transferencia (pendiente, $5.790) y uno con tarjeta (pagado, $790).
    const d = (await admin.get('/api/admin/dashboard?dias=30')).body.data;
    assert.deepEqual(d.kpis, {
      ventas: 790,
      ventasAnterior: 0,
      pedidos: 2,
      pedidosAnterior: 0,
      ticketPromedio: 790,
      ticketPromedioAnterior: 0,
      clientesNuevos: 2,
      clientesNuevosAnterior: 0,
    });
    assert.equal(d.serie.length, 30, 'un punto por día');
    assert.deepEqual(d.serie.at(-1), { fecha: d.serie.at(-1).fecha, ventas: 790, pedidos: 2 });
    assert.deepEqual(d.topProductos, [{ id: 1, nombre: 'Lápiz pasta azul', unidades: 1, ingresos: 790 }]);
    assert.deepEqual(d.porCategoria, [{ categoria: 'Libreria', ingresos: 790 }]);
    assert.deepEqual(d.atencion, { pagosPorConfirmar: 1, montoPorConfirmar: 5790, porEnviar: 1, sinStock: 0, stockBajo: 14 });
    assert.equal(d.stockCritico[0].nombre, 'Calculadora');
    assert.equal(d.ultimosPedidos.length, 2);

    const anual = (await admin.get('/api/admin/dashboard?dias=365')).body.data;
    assert.ok(anual.serie.length >= 12 && anual.serie.length <= 13, 'un punto por mes');

    assert.deepEqual((await admin.get('/api/admin/counts')).body.data, { pedidosPendientes: 1, porEnviar: 1, stockBajo: 14 });
  });

  test('productos: unidades vendidas, stock rápido y cambio en lote', async () => {
    const admin = await loggedAdmin();
    const lapiz = (await admin.get('/api/admin/products')).body.data.find((p: { id: number }) => p.id === 1);
    assert.equal(lapiz.vendidos, 2);

    assert.equal((await admin.patch('/api/admin/products/1/stock', { stock: -1 })).status, 400);
    assert.equal((await admin.patch('/api/admin/products/999/stock', { stock: 5 })).status, 404);
    assert.equal((await admin.patch('/api/admin/products/1/stock', { stock: 50 })).body.data.stock, 50);

    assert.equal((await admin.patch('/api/admin/products/status', { ids: [], estado: 'inactivo' })).status, 400);
    const total = (await new Client(base).get('/api/products')).body.data.total;
    assert.equal((await admin.patch('/api/admin/products/status', { ids: [4, 5], estado: 'inactivo' })).body.data.actualizados, 2);
    assert.equal((await new Client(base).get('/api/products')).body.data.total, total - 2);
    await admin.patch('/api/admin/products/status', { ids: [4, 5], estado: 'activo' });
    assert.equal((await new Client(base).get('/api/products')).body.data.total, total);
  });

  test('crea y edita productos con imagen validada', async () => {
    const admin = await loggedAdmin();
    const form = (extra: Record<string, string | Blob> = {}) => {
      const f = new FormData();
      Object.entries({ nombre: 'Cuaderno', precio: '1500', stock: '5', idCategoria: '1', idFamilia: '1', estado: 'activo', descripcion: 'Universitario', ...extra }).forEach(
        ([k, v]) => f.append(k, v),
      );
      return f;
    };

    const fake = await admin.post('/api/admin/products', form({ imagen: new Blob(['<?php echo 1; ?>']) }));
    assert.equal(fake.status, 400);
    const big = await admin.post('/api/admin/products', form({ imagen: new Blob([Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)])]) }));
    assert.equal(big.status, 400);
    assert.equal((await admin.post('/api/admin/products', form({ idFamilia: '2' }))).status, 400, 'familia de otra categoría');

    const created = await admin.post('/api/admin/products', form({ imagen: new Blob([PNG], { type: 'image/png' }) }));
    assert.equal(created.status, 201, created.text);
    const product = created.body.data;
    assert.match(product.codigoBarras, /^ML\d{11}$/);
    assert.match(product.imagen, /^\/uploads\/productos\/producto_\w+\.png$/);
    assert.ok(fs.existsSync(path.join(uploadsDir(), path.basename(product.imagen))));

    assert.equal((await admin.post(`/api/admin/products/${product.id}`, form({ codigoBarras: 'ML00000000001' }))).status, 409);

    const updated = await admin.post(`/api/admin/products/${product.id}`, form({ nombre: 'Cuaderno 100 hojas', imagen: new Blob([PNG]) }));
    assert.equal(updated.status, 200, updated.text);
    assert.notEqual(updated.body.data.imagen, product.imagen);
    assert.ok(!fs.existsSync(path.join(uploadsDir(), path.basename(product.imagen))), 'la imagen anterior se elimina');

    const hidden = await admin.patch(`/api/admin/products/${product.id}/status`, { estado: 'inactivo' });
    assert.equal(hidden.body.data.estado, 'inactivo');
    assert.equal((await new Client(base).get(`/api/products/${product.id}`)).status, 404);
  });

  test('cancelar un pedido devuelve el stock y no se puede reactivar', async () => {
    const admin = await loggedAdmin();
    const orders = (await admin.get('/api/admin/orders')).body.data;
    const pendiente = orders.find((o: { estado: string }) => o.estado === 'pendiente');
    assert.ok(pendiente.cliente && pendiente.correo);

    const detail = await admin.get(`/api/admin/orders/${pendiente.id}`);
    assert.equal(detail.body.data.rut, NEW_USER.rut);

    const stockAntes = Number(await db.value('SELECT stock FROM productos WHERE id = 2'));
    const enviado = await admin.patch(`/api/admin/orders/${pendiente.id}/status`, {
      estado: 'enviado',
      nota: 'Despachado por Starken, seguimiento 123',
      notificar: true,
    });
    assert.equal(enviado.status, 200);
    // El cliente recibe el aviso con la nota.
    await waitForMail(new RegExp(`Pedido #${pendiente.id}[\\s\\S]*Despachado por Starken, seguimiento 123`));

    // Repetir el estado con una nota solo agrega la nota; sin nota no hace nada.
    await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'enviado', nota: 'Cliente avisado por WhatsApp' });
    await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'enviado' });
    assert.equal((await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'enviado', nota: 'x'.repeat(501) })).status, 400);

    assert.equal((await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'cancelado' })).status, 200);
    assert.equal(Number(await db.value('SELECT stock FROM productos WHERE id = 2')), stockAntes + 2);
    assert.equal((await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'pagado' })).status, 409);
    assert.equal((await admin.patch(`/api/admin/orders/${pendiente.id}/status`, { estado: 'perdido' })).status, 400);

    const historial = (await admin.get(`/api/admin/orders/${pendiente.id}`)).body.data.historial;
    assert.deepEqual(
      historial.map((h: { estado: string; nota: string | null; administrador: string | null }) => [h.estado, h.nota, h.administrador]),
      [
        ['pendiente', 'Pedido creado por el cliente', null],
        ['enviado', 'Despachado por Starken, seguimiento 123', 'testadmin'],
        ['enviado', 'Cliente avisado por WhatsApp', 'testadmin'],
        ['cancelado', null, 'testadmin'],
      ],
    );

    // El cliente ve el seguimiento (estados y fechas), sin notas internas ni nombres de administradores.
    const seguimiento = (await (await loggedUser()).get(`/api/orders/${pendiente.id}`)).body.data.seguimiento;
    assert.deepEqual(seguimiento.map((s: { estado: string }) => s.estado), ['pendiente', 'enviado', 'enviado', 'cancelado']);
    assert.deepEqual(Object.keys(seguimiento[0]).sort(), ['estado', 'fecha']);
  });

  test('clientes: editar y no eliminar a quien tiene pedidos', async () => {
    const admin = await loggedAdmin();
    const users = (await admin.get('/api/admin/users')).body.data;
    const ana = users.find((u: { correo: string }) => u.correo === NEW_USER.correo);
    const otro = users.find((u: { correo: string }) => u.correo === 'otro@test.cl');

    // Totales del cliente: solo cuenta lo pagado (el pedido cancelado no suma).
    assert.equal(ana.pedidos, 2);
    assert.equal(ana.totalGastado, 790);
    assert.ok(ana.ultimoPedido && ana.creadoEn);
    const ficha = (await admin.get(`/api/admin/users/${ana.id}`)).body.data;
    assert.equal(ficha.historialPedidos.length, 2);
    assert.equal((await admin.get('/api/admin/users/999')).status, 404);

    assert.equal((await admin.put(`/api/admin/users/${ana.id}`, { ...ana, correo: 'otro@test.cl' })).status, 409);
    assert.equal((await admin.put(`/api/admin/users/${ana.id}`, { ...ana, direccion: 'Editada' })).body.data.direccion, 'Editada');
    assert.equal((await admin.delete(`/api/admin/users/${ana.id}`)).status, 409);
    assert.equal((await admin.delete(`/api/admin/users/${otro.id}`)).status, 200);
  });

  test('categorías y familias', async () => {
    const admin = await loggedAdmin();
    const cat = await admin.post('/api/admin/categories', { nombre: 'Arte' });
    assert.equal(cat.status, 201);
    assert.equal((await admin.post('/api/admin/categories', { nombre: 'Arte' })).status, 409);
    assert.equal((await admin.put(`/api/admin/categories/${cat.body.data.id}`, { nombre: 'Arte y diseño' })).status, 200);

    const fam = await admin.post('/api/admin/families', { nombre: 'Pinceles', idCategoria: cat.body.data.id });
    assert.equal(fam.status, 201);
    // Mover la familia "Lápices" a Arte también mueve sus productos.
    assert.equal((await admin.put('/api/admin/families/1', { nombre: 'Lápices', idCategoria: cat.body.data.id })).status, 200);
    assert.equal(await db.value('SELECT categoria_id FROM productos WHERE id = 1'), cat.body.data.id);

    const families = (await admin.get('/api/admin/families')).body.data;
    assert.ok(families.some((f: { nombre: string; productos: number }) => f.nombre === 'Lápices' && f.productos >= 1));
    assert.equal((await admin.delete(`/api/admin/families/${fam.body.data.id}`)).status, 200);
    assert.equal((await admin.delete(`/api/admin/categories/${cat.body.data.id}`)).status, 200);
    assert.equal((await admin.delete(`/api/admin/categories/${cat.body.data.id}`)).status, 404);
  });

  test('configuración de la tienda: pública para leer, solo admin para editar', async () => {
    const admin = await loggedAdmin();
    const valida = {
      telefono: '+56 9 4187 0729',
      correo: 'contacto@tienda.cl',
      direccion: "Estancilla 853, Codegua, O'Higgins",
      whatsapp: 'https://wa.me/56941870729',
      instagram: '',
      facebook: 'https://facebook.com/mundolibreria',
      horarios: [
        { dia: 'Lunes - Viernes', horario: '9:00 - 20:00' },
        { dia: 'Sábados', horario: '10:00 - 14:00' },
      ],
      datosTransferencia: 'Banco Estado, Cuenta RUT 12.345.678-5, contacto@tienda.cl',
    };

    assert.equal((await (await loggedUser()).put('/api/admin/settings', valida)).status, 403);
    assert.equal((await admin.put('/api/admin/settings', { ...valida, whatsapp: 'javascript:alert(1)' })).status, 400);
    assert.equal((await admin.put('/api/admin/settings', { ...valida, correo: 'no-es-correo' })).status, 400);
    assert.equal((await admin.put('/api/admin/settings', { ...valida, horarios: [{ dia: 'Lunes', horario: '' }] })).status, 400);

    const guardada = await admin.put('/api/admin/settings', valida);
    assert.equal(guardada.status, 200, guardada.text);
    const publica = (await new Client(base).get('/api/settings')).body.data;
    assert.equal(publica.instagram, null, 'un campo vacío queda en NULL');
    assert.deepEqual(publica.horarios, valida.horarios);

    // Un pedido por transferencia incluye los datos bancarios en el correo de confirmación.
    const c = await loggedUser();
    await c.post('/api/cart/items', { productId: 1, cantidad: 1 });
    const pedido = await c.post('/api/orders', { nombre: 'Ana', correo: NEW_USER.correo, metodoPago: 'transferencia' });
    assert.equal(pedido.status, 201);
    await waitForMail(new RegExp(`Orden #${pedido.body.data.id}[\\s\\S]*Banco Estado, Cuenta RUT`));
  });

  test('administradores', async () => {
    const admin = await loggedAdmin();
    assert.equal((await admin.post('/api/admin/admins', { nombre: 'nuevo', password: 'corta' })).status, 400);
    const created = await admin.post('/api/admin/admins', { nombre: 'nuevo', password: 'Nuevo123!' });
    assert.equal(created.status, 201);

    const nuevo = await new Client(base).start();
    assert.equal((await nuevo.post('/api/auth/login', { correo: 'nuevo', password: 'Nuevo123!' })).status, 200);
    assert.equal((await nuevo.delete(`/api/admin/admins/${created.body.data.id}`)).status, 409, 'no puede eliminarse a sí mismo');
    assert.equal((await admin.delete(`/api/admin/admins/${created.body.data.id}`)).status, 200);
  });
});
