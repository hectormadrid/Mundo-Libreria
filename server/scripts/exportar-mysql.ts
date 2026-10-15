/**
 * Exporta los datos de la base MySQL antigua (versión PHP) a un archivo SQL para
 * el esquema PostgreSQL nuevo (database/schema.sql). El archivo resultante se
 * ejecuta en Supabase (SQL Editor) sobre una base recién creada.
 *
 * Uso (desde la carpeta server, con MySQL encendido):
 *   npx tsx scripts/exportar-mysql.ts salida.sql
 *
 * Conexión MySQL: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASS, MYSQL_DB
 * (por defecto localhost:3306, root sin contraseña, base mundo_libreria).
 *
 * Además de copiar los datos:
 *   - decodifica los textos que PHP guardó con htmlspecialchars() ("O&#039;Higgins");
 *   - convierte precios a enteros y textos vacíos a NULL;
 *   - interpreta las fechas de MySQL como hora de Chile;
 *   - copia en cada pedido el nombre/correo del cliente y el nombre de cada producto.
 */
import fs from 'node:fs';
import mysql from 'mysql2/promise';

type Row = Record<string, any>;

const output = process.argv[2];
if (!output) {
  console.error('Indica el archivo de salida: npx tsx scripts/exportar-mysql.ts salida.sql');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASS ?? '',
  database: process.env.MYSQL_DB ?? 'mundo_libreria',
  dateStrings: true,
  decimalNumbers: true,
});

const rows = async (sql: string) => (await conn.query(sql))[0] as Row[];

// ------------------------------------------------------------------ utilidades

const ENTIDADES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&#39;': "'", '&apos;': "'" };

function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (m, code) => ENTIDADES[m] ?? String.fromCodePoint(Number(code)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENTIDADES[m]);
}

/** Texto limpio o NULL si queda vacío. */
const text = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const clean = decode(String(value)).trim();
  return clean === '' ? null : clean;
};

function sql(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Fecha de MySQL ('YYYY-MM-DD HH:MM:SS', hora local de la tienda) como timestamptz. */
const fecha = (value: unknown) => (value ? `(${sql(String(value))}::timestamp AT TIME ZONE 'America/Santiago')` : 'now()');

const lines: string[] = [];
const insert = (table: string, columns: string[], values: string[][]) => {
  if (!values.length) return;
  lines.push(`INSERT INTO public.${table} (${columns.join(', ')}) OVERRIDING SYSTEM VALUE VALUES`);
  lines.push(values.map((v) => `  (${v.join(', ')})`).join(',\n') + ';\n');
};
// Las tablas sin columna identity no aceptan OVERRIDING SYSTEM VALUE.
const insertPlain = (table: string, columns: string[], values: string[][]) => {
  if (!values.length) return;
  lines.push(`INSERT INTO public.${table} (${columns.join(', ')}) VALUES`);
  lines.push(values.map((v) => `  (${v.join(', ')})`).join(',\n') + ';\n');
};

// ------------------------------------------------------------------ datos

const categorias = await rows('SELECT * FROM categorias ORDER BY id');
const familias = await rows('SELECT * FROM familias ORDER BY id');
const productos = await rows('SELECT * FROM productos ORDER BY id');
const usuarios = await rows('SELECT * FROM usuario ORDER BY id');
const admins = await rows('SELECT * FROM Administrador ORDER BY id');
const carrito = await rows('SELECT id_usuario, id_producto, SUM(cantidad) AS cantidad FROM carrito GROUP BY id_usuario, id_producto');
const pedidos = await rows('SELECT * FROM pedido ORDER BY id');
const detalles = await rows(
  `SELECT d.id_pedido, d.id_producto, SUM(d.cantidad) AS cantidad, MAX(d.precio) AS precio, MAX(p.nombre) AS nombre
   FROM detalle_pedido d JOIN productos p ON d.id_producto = p.id
   GROUP BY d.id_pedido, d.id_producto`,
);
await conn.end();

lines.push('-- Datos exportados desde MySQL por server/scripts/exportar-mysql.ts');
lines.push(`-- Generado: ${new Date().toISOString()}\n`);
lines.push('BEGIN;\n');

insert('categorias', ['id', 'nombre', 'creado_en'], categorias.map((c) => [sql(c.id), sql(text(c.nombre)), fecha(c.fecha_creacion)]));
insert('familias', ['id', 'categoria_id', 'nombre', 'creado_en'], familias.map((f) => [sql(f.id), sql(f.id_categoria), sql(text(f.nombre)), fecha(f.fecha_creacion)]));
insert(
  'productos',
  ['id', 'nombre', 'codigo_barras', 'categoria_id', 'familia_id', 'descripcion', 'marca', 'color', 'precio', 'stock', 'activo', 'imagen', 'creado_en'],
  productos.map((p) => [
    sql(p.id),
    sql(text(p.nombre)),
    sql(text(p.codigo_barras)),
    sql(p.id_categoria),
    sql(p.id_familia),
    sql(text(p.descripcion === '0' ? '' : p.descripcion) ?? ''),
    sql(text(p.marca)),
    sql(text(p.color)),
    sql(Math.round(Number(p.precio))),
    sql(Math.max(0, Number(p.stock ?? 0))),
    sql(String(p.estado).toLowerCase() === 'activo'),
    sql(text(p.imagen)),
    fecha(p.fecha_creacion),
  ]),
);
insert(
  'clientes',
  ['id', 'rut', 'nombre', 'correo', 'telefono', 'direccion', 'password_hash'],
  usuarios.map((u) => [sql(u.id), sql(text(u.rut)), sql(text(u.nombre)), sql(text(u.correo)), sql(text(u.telefono)), sql(text(u.direccion)), sql(u.password)]),
);
insert('administradores', ['id', 'usuario', 'password_hash'], admins.map((a) => [sql(a.id), sql(text(a.nombre)), sql(a.password)]));
insertPlain('carrito_items', ['cliente_id', 'producto_id', 'cantidad'], carrito.map((c) => [sql(c.id_usuario), sql(c.id_producto), sql(Number(c.cantidad))]));

const usuarioPorId = new Map(usuarios.map((u) => [u.id, u]));
const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];
const METODOS = ['transferencia', 'tarjeta', 'efectivo'];
insert(
  'pedidos',
  ['id', 'cliente_id', 'estado', 'metodo_pago', 'total', 'nombre_contacto', 'correo_contacto', 'telefono_contacto', 'direccion_envio', 'creado_en'],
  pedidos.map((p) => {
    const u = usuarioPorId.get(p.id_usuario) ?? {};
    return [
      sql(p.id),
      sql(p.id_usuario),
      sql(ESTADOS.includes(p.estado) ? p.estado : 'pendiente'),
      sql(METODOS.includes(p.metodo_pago) ? p.metodo_pago : 'efectivo'),
      sql(Math.round(Number(p.total))),
      sql(text(u.nombre) ?? 'Cliente'),
      sql(text(u.correo) ?? ''),
      sql(text(p.telefono_contacto) ?? text(u.telefono)),
      sql(text(p.direccion_envio)),
      fecha(p.fecha),
    ];
  }),
);
insertPlain(
  'pedido_items',
  ['pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario'],
  detalles.map((d) => [sql(d.id_pedido), sql(d.id_producto), sql(text(d.nombre) ?? 'Producto'), sql(Number(d.cantidad)), sql(Math.round(Number(d.precio)))]),
);

// Las columnas identity deben continuar después del mayor id importado.
for (const table of ['categorias', 'familias', 'productos', 'clientes', 'administradores', 'pedidos']) {
  lines.push(`SELECT setval(pg_get_serial_sequence('public.${table}', 'id'), coalesce((SELECT max(id) FROM public.${table}), 0) + 1, false);`);
}
lines.push('\nCOMMIT;');

fs.writeFileSync(output, lines.join('\n') + '\n');
console.log(
  `Exportado a ${output}: ${categorias.length} categorías, ${familias.length} familias, ${productos.length} productos, ` +
    `${usuarios.length} clientes, ${admins.length} administradores, ${carrito.length} ítems de carrito, ` +
    `${pedidos.length} pedidos, ${detalles.length} ítems de pedido.`,
);
