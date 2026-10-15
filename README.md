# Mundo Librería

Tienda en línea de artículos de librería, papelería y oficina.

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 (`frontend/`)
- **Backend:** API REST en PHP 8.2 + MySQL/MariaDB (`public/api/` y `src/`)

## Estructura

```
frontend/            Código fuente de la app React (tienda + panel admin)
public/              Carpeta que publica Apache
  api/index.php      Punto de entrada único de la API (rutas en este archivo)
  index.html, static/  Build de React (generado con `npm run build`)
  assets/            Logo e íconos
  uploads/productos/ Imágenes subidas desde el panel
src/
  Controllers/       Lógica de cada recurso de la API (Admin/ = panel)
  Http/              Router, Request, Response, autenticación, límite de intentos
  Database/          Conexión y helpers de consultas preparadas
  Helpers/           Sesión, validaciones, correo, subida de imágenes
database/            Esquema y migraciones
```

## Puesta en marcha local (XAMPP)

1. `composer install` (si `vendor/` no existe).
2. Copia `.env.example` a `.env` y completa los datos de la base de datos.
3. Base de datos:
   - **Nueva:** importa `database/base_de_datos.sql`.
   - **Existente:** ejecuta, en orden y una sola vez, `database/update_pedido_table.sql` (si aún no tienes la columna `metodo_pago`), `database/migracion_api.sql` y luego `php database/decodificar_entidades.php`.
4. Compila el frontend:
   ```bash
   cd frontend && npm install && npm run build
   ```
5. Abre `http://localhost/Mundo-Libreria/public/` (panel: `/admin`).

## Desarrollo

Con recarga en caliente, en dos terminales dentro de `frontend/`:

```bash
npm run api
```

```bash
npm run dev
```

La app queda en `http://localhost:5173` y Vite reenvía `/api`, `/uploads` y `/assets` al servidor PHP del puerto 8000.

`npm run typecheck` revisa los tipos sin compilar.

## Despliegue en el servidor

1. Configura el `DocumentRoot` del sitio para que apunte a `public/` (recomendado). Si no es posible, el `.htaccess` de la raíz bloquea el acceso a `.env`, `src/`, `vendor/`, `database/` y `.git`.
2. El servidor necesita `mod_rewrite` y `AllowOverride All`.
3. Compila con la ruta base que corresponda:
   - Sitio en la raíz del dominio: `npm run build:server`
   - Sitio en `/Mundo-Libreria/public/` (XAMPP): `npm run build`
4. Sube `public/`, `src/`, `vendor/` y `.env` (con `APP_URL` y los datos SMTP de producción).

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
