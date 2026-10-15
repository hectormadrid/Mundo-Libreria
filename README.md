# Mundo Librería

Tienda en línea de artículos de librería, papelería y oficina.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 (`frontend/`)
- **Servidor:** Node.js + Express 5 + TypeScript + MySQL/MariaDB (`server/`)

Un solo proceso de Node sirve la API (`/api/...`), la app React y las imágenes.

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
  uploads/productos/ Imágenes subidas desde el panel
database/            Esquema y migraciones SQL
```

## Requisitos

- Node.js 20 o superior
- MySQL 5.7+ o MariaDB 10.4+ (el de XAMPP sirve)

## Puesta en marcha

1. Instala las dependencias:
   ```bash
   npm run install:all
   ```
2. Copia `.env.example` a `.env` y completa los datos de la base de datos.
3. Base de datos:
   - **Nueva:** importa `database/base_de_datos.sql`.
   - **Existente (de la versión PHP):** ejecuta una sola vez y en orden `database/update_pedido_table.sql` (solo si aún no tienes la columna `metodo_pago`) y `database/migracion_api.sql`. Después ejecuta `npm run decodificar-entidades --prefix server`.
4. Compila y arranca:
   ```bash
   npm run build
   ```
   ```bash
   npm start
   ```
5. Abre `http://localhost:3000` (panel: `http://localhost:3000/admin`).

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

Las pruebas crean y borran una base `mundo_libreria_test` en el MySQL local (usuario `root` sin contraseña). Para usar otros datos de conexión, define `TEST_DB_HOST`, `TEST_DB_USER`, `TEST_DB_PASS` o `TEST_DB_NAME`.

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

Las sesiones se guardan en la tabla `sessions` de MySQL, así que sobreviven a los reinicios.

## API

Todas las respuestas son JSON: `{ "data": ... }` o `{ "error": "mensaje" }` con el código HTTP correspondiente.
Las peticiones que modifican datos requieren la cabecera `X-CSRF-Token`, que se obtiene en `GET /api/auth/session`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/auth/session` | Usuario/admin actual y token CSRF |
| POST | `/auth/login`, `/auth/register`, `/auth/logout` | Sesión de clientes |
| POST | `/auth/forgot-password`, `/auth/reset-password`, `/auth/reset-password/validate` | Recuperar contraseña |
| POST | `/admin/auth/login` | Sesión de administradores |
| GET | `/categories`, `/families?categoria=` | Catálogo |
| GET | `/products?categoria=&familia=&q=&page=`, `/products/{id}` | Productos activos (12 por página) |
| GET, DELETE | `/cart` | Ver / vaciar carrito |
| POST | `/cart/items` | Agregar `{ productId, cantidad }` |
| PATCH, DELETE | `/cart/items/{productId}` | Cambiar cantidad / quitar |
| GET, PUT | `/profile` | Perfil del cliente |
| GET, POST | `/orders` | Pedidos del cliente / crear pedido desde el carrito |
| GET | `/orders/{id}` | Detalle de un pedido propio |
| GET | `/admin/metrics` | Métricas del panel |
| GET, POST | `/admin/products` | Listar / crear (multipart) |
| POST | `/admin/products/{id}` | Editar (multipart) |
| PATCH | `/admin/products/{id}/status` | Activar / desactivar |
| GET | `/admin/orders`, `/admin/orders/{id}` | Pedidos |
| PATCH | `/admin/orders/{id}/status` | Cambiar estado (cancelar devuelve el stock) |
| GET, PUT, DELETE | `/admin/users`, `/admin/users/{id}` | Clientes |
| GET, POST, PUT, DELETE | `/admin/categories[/{id}]`, `/admin/families[/{id}]` | Categorías y familias |
| GET, POST, DELETE | `/admin/admins[/{id}]` | Administradores |

## Pendiente

- **Pasarela de pago real:** el pago con tarjeta está simulado (el pedido se marca como pagado sin cobrar). Para producción hay que integrar Webpay, Mercado Pago o Flow.
