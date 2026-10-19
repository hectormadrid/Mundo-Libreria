# Mundo Librería

Tienda en línea de artículos de librería, papelería y oficina.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 (`frontend/`)
- **Servidor:** Node.js + Express 5 + TypeScript (`server/`)
- **Base de datos e imágenes:** Supabase (PostgreSQL + Storage)

Un solo proceso de Node sirve la API (`/api/...`) y la app React. Las imágenes de productos
se guardan en el bucket `productos` de Supabase Storage.

## Estructura

```
frontend/            App React (tienda + panel admin)
server/
  src/index.ts       Arranque del servidor
  src/app.ts         Middlewares, sesiones, archivos estáticos
  src/routes/        Rutas de la API (auth, catálogo, carrito, cuenta, admin)
  test/              Pruebas automáticas de la API
  scripts/           Scripts de mantenimiento
public/              Archivos que sirve Node
  index.html, static/  Build de React (se genera con `npm run build`)
  assets/            Logo e íconos
  uploads/productos/ Imágenes de la versión antigua (y respaldo local sin Supabase)
database/
  schema.sql         Esquema PostgreSQL (tablas, restricciones, RLS)
  supabase.sql       Permisos y bucket de imágenes (solo Supabase)
```

## Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase

## Puesta en marcha

1. Instala las dependencias:
   ```bash
   npm run install:all
   ```
2. Copia `.env.example` a `.env` y completa:
   - `DATABASE_URL`: en el Dashboard de Supabase, botón **Connect** → **Session pooler**, con tu contraseña de la base.
   - `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (Settings → API Keys → clave secreta `sb_secret_...`).
   - `SESSION_SECRET`: una cadena aleatoria larga.
3. Base de datos (solo en un proyecto nuevo): en el **SQL Editor** de Supabase ejecuta `database/schema.sql` y luego `database/supabase.sql`.
4. Compila y arranca:
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```
5. Abre `http://localhost:3000`.

### Acceso al panel de administración

La tienda no muestra ningún enlace al panel. Los administradores usan el mismo formulario de
"Iniciar sesión" que los clientes, escribiendo su **usuario de administrador** en el campo del
correo; al entrar van directo al panel (`/admin`). Los usuarios de administrador no pueden
contener `@`, para no confundirse con el correo de un cliente.

## Desarrollo

Con recarga en caliente, en dos terminales:

```bash
npm run dev --prefix server
```

```bash
npm run dev --prefix frontend
```

La app queda en `http://localhost:5173`. Vite reenvía `/api`, `/uploads` y `/assets` al servidor del puerto 3000.

## Pruebas

```bash
npm test
```

Las pruebas levantan un PostgreSQL en memoria ([PGlite](https://pglite.dev)) con `database/schema.sql`: no necesitan instalar nada ni tocan el proyecto de Supabase.

## Migrar datos desde la versión PHP/MySQL

1. Con el MySQL antiguo encendido, genera el SQL de los datos:
   ```bash
   npm run exportar-mysql --prefix server -- datos.sql
   ```
   (Conexión: variables `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASS`, `MYSQL_DB`; por defecto el MySQL de XAMPP.)
2. Ejecuta `datos.sql` en el SQL Editor de Supabase, sobre una base recién creada con `schema.sql`. Bórralo después: contiene los hashes de las contraseñas.
3. Sube las imágenes de `public/uploads/productos` al bucket:
   ```bash
   npm run subir-imagenes --prefix server
   ```

Las contraseñas existentes siguen funcionando: el servidor acepta los hashes creados por PHP.

## Despliegue

1. El hosting debe permitir aplicaciones Node.js (en cPanel: "Setup Node.js App"; o un VPS).
2. Sube el proyecto, ejecuta `npm run install:all` y `npm run build`, y arranca con `npm start` (o apunta el gestor de Node del hosting a `server/dist/index.js`).
3. En el `.env` de producción define:
   - `NODE_ENV=production`
   - `SESSION_SECRET` con al menos 32 caracteres aleatorios
   - `APP_URL` con la dirección pública de la tienda
   - los datos SMTP para enviar correos
   - `TRUST_PROXY=1` si el servidor está detrás de un proxy (lo habitual en cPanel y Nginx)
4. Usa HTTPS: con él, la cookie de sesión se marca automáticamente como segura.

Las sesiones se guardan en la tabla `sesiones` de la base de datos, así que sobreviven a los reinicios.

### Seguridad de la base de datos

La tienda accede a Supabase solo desde el servidor Node. Todas las tablas tienen RLS activado
sin políticas y los roles públicos (`anon`, `authenticated`) no tienen permisos, así que la API
pública de Supabase no expone ningún dato. La clave secreta y la contraseña de la base nunca
deben llegar al frontend ni al repositorio.

En el plan gratuito, Supabase pausa el proyecto tras una semana sin actividad; se reactiva desde el Dashboard.

## API

Todas las respuestas son JSON: `{ "data": ... }` o `{ "error": "mensaje" }` con el código HTTP correspondiente.
Las peticiones que modifican datos requieren la cabecera `X-CSRF-Token`, que se obtiene en `GET /api/auth/session`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/auth/session` | Usuario/admin actual y token CSRF |
| POST | `/auth/login` | Inicio de sesión único: `{ correo, password }`, donde `correo` es el correo de un cliente o el usuario de un administrador |
| POST | `/auth/register`, `/auth/logout` | Registro de clientes / cerrar sesión |
| POST | `/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/validate` | Recuperar contraseña |
| GET | `/categories`, `/families?categoria=` | Catálogo |
| GET | `/products?categoria=&familia=&q=&page=`, `/products/{id}` | Productos activos (12 por página) |
| GET, DELETE | `/cart` | Ver / vaciar carrito |
| POST | `/cart/items` | Agregar `{ productId, cantidad }` |
| PATCH, DELETE | `/cart/items/{productId}` | Cambiar cantidad / quitar |
| GET, PUT | `/profile` | Perfil del cliente |
| GET, POST | `/orders` | Pedidos del cliente / crear pedido desde el carrito |
| GET | `/orders/{id}` | Detalle de un pedido propio, con su seguimiento (estados y fechas) |
| GET | `/settings` | Datos públicos de la tienda: contacto, redes, horarios y datos de transferencia |
| GET | `/admin/dashboard?dias=7\|30\|90\|365` | Indicadores con comparación al período anterior, serie de ventas, ranking de productos, ventas por categoría y alertas |
| GET | `/admin/counts` | Pendientes para el menú: pagos por confirmar, pedidos por enviar, stock bajo |
| PUT | `/admin/settings` | Editar la configuración de la tienda |
| GET, POST | `/admin/products` | Listar (incluye unidades vendidas) / crear (multipart) |
| POST | `/admin/products/{id}` | Editar (multipart) |
| PATCH | `/admin/products/{id}/status` | Activar / desactivar |
| PATCH | `/admin/products/{id}/stock` | Ajuste rápido de stock `{ stock }` |
| PATCH | `/admin/products/status` | Activar / desactivar en lote `{ ids, estado }` |
| GET | `/admin/orders`, `/admin/orders/{id}` | Pedidos (el detalle incluye el historial de cambios) |
| PATCH | `/admin/orders/{id}/status` | Cambiar estado `{ estado, nota?, notificar? }`: queda en el historial y puede avisar al cliente por correo (cancelar devuelve el stock) |
| GET, PUT, DELETE | `/admin/users`, `/admin/users/{id}` | Clientes con totales; `GET /admin/users/{id}` es la ficha con sus pedidos |
| GET, POST, PUT, DELETE | `/admin/categories[/{id}]`, `/admin/families[/{id}]` | Categorías y familias |
| GET, POST, DELETE | `/admin/admins[/{id}]` | Administradores |

## Pendiente

- **Pasarela de pago real:** el pago con tarjeta está simulado (el pedido se marca como pagado sin cobrar). Para producción hay que integrar Webpay, Mercado Pago o Flow.
