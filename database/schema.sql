-- =====================================================================
-- Mundo Librería: esquema PostgreSQL (Supabase)
--
-- Cambios respecto del esquema MySQL anterior:
--   * Precios en pesos chilenos como enteros (sin decimales).
--   * Estados de pedido y métodos de pago como tipos ENUM.
--   * Productos con `activo` (boolean) en vez de un texto 'activo'/'inactivo'.
--   * El carrito usa (cliente, producto) como clave: no puede haber filas duplicadas.
--   * Los pedidos guardan una copia de los datos de contacto y del nombre y precio
--     de cada producto, para que el historial no cambie si después se edita el producto.
--   * Borrar un cliente o un producto con pedidos queda bloqueado (antes se borraba
--     el historial de ventas en cascada).
--   * Correos, usuarios de admin, categorías y familias son únicos sin distinguir
--     mayúsculas.
--   * Fechas con zona horaria (timestamptz).
--
-- Seguridad: la tienda solo accede a la base desde el servidor Node. RLS está
-- activado sin políticas y se retiran los permisos de los roles anon/authenticated,
-- así la API pública de Supabase (Data API) no puede leer ni modificar estas tablas.
-- =====================================================================

create type public.estado_pedido as enum ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado');
create type public.metodo_pago as enum ('transferencia', 'tarjeta', 'efectivo');

-- Mantiene `actualizado_en` al día en cada UPDATE.
create function public.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- Catálogo

create table public.categorias (
  id integer generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 100),
  creado_en timestamptz not null default now()
);
create unique index categorias_nombre_unico on public.categorias (lower(nombre));

create table public.familias (
  id integer generated always as identity primary key,
  categoria_id integer not null references public.categorias (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 100),
  creado_en timestamptz not null default now()
);
create unique index familias_nombre_unico on public.familias (categoria_id, lower(nombre));

create table public.productos (
  id integer generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 100),
  codigo_barras text unique check (char_length(codigo_barras) <= 50),
  categoria_id integer references public.categorias (id) on delete set null,
  familia_id integer references public.familias (id) on delete set null,
  descripcion text not null default '',
  marca text check (char_length(marca) <= 100),
  color text check (char_length(color) <= 50),
  precio integer not null check (precio >= 0),
  stock integer not null default 0 check (stock >= 0),
  activo boolean not null default true,
  -- Ruta del archivo dentro del bucket `productos` de Supabase Storage.
  imagen text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index productos_categoria_idx on public.productos (categoria_id);
create index productos_familia_idx on public.productos (familia_id);
create index productos_catalogo_idx on public.productos (id desc) where activo and stock > 0;
create trigger productos_actualizado before update on public.productos
  for each row execute function public.marcar_actualizado();

-- ---------------------------------------------------------------- Personas

create table public.clientes (
  id integer generated always as identity primary key,
  rut text not null unique check (char_length(rut) between 8 and 12),
  nombre text not null check (char_length(nombre) between 1 and 100),
  correo text not null check (char_length(correo) <= 254),
  telefono text check (char_length(telefono) <= 20),
  direccion text check (char_length(direccion) <= 255),
  password_hash text not null,
  reset_token_hash text unique,
  reset_token_expira timestamptz,
  creado_en timestamptz not null default now()
);
create unique index clientes_correo_unico on public.clientes (lower(correo));

create table public.administradores (
  id integer generated always as identity primary key,
  usuario text not null check (char_length(usuario) between 1 and 50),
  password_hash text not null,
  creado_en timestamptz not null default now()
);
create unique index administradores_usuario_unico on public.administradores (lower(usuario));

-- ---------------------------------------------------------------- Compras

create table public.carrito_items (
  cliente_id integer not null references public.clientes (id) on delete cascade,
  producto_id integer not null references public.productos (id) on delete cascade,
  cantidad integer not null check (cantidad > 0),
  agregado_en timestamptz not null default now(),
  primary key (cliente_id, producto_id)
);
create index carrito_items_producto_idx on public.carrito_items (producto_id);

create table public.pedidos (
  id integer generated always as identity primary key,
  cliente_id integer not null references public.clientes (id) on delete restrict,
  estado public.estado_pedido not null default 'pendiente',
  metodo_pago public.metodo_pago not null,
  total integer not null check (total >= 0),
  -- Datos de contacto y envío tal como se ingresaron en el checkout.
  nombre_contacto text not null check (char_length(nombre_contacto) <= 100),
  correo_contacto text not null check (char_length(correo_contacto) <= 254),
  telefono_contacto text check (char_length(telefono_contacto) <= 20),
  direccion_envio text check (char_length(direccion_envio) <= 255),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index pedidos_cliente_idx on public.pedidos (cliente_id, creado_en desc);
create index pedidos_estado_idx on public.pedidos (estado);
create trigger pedidos_actualizado before update on public.pedidos
  for each row execute function public.marcar_actualizado();

create table public.pedido_items (
  pedido_id integer not null references public.pedidos (id) on delete cascade,
  producto_id integer not null references public.productos (id) on delete restrict,
  nombre_producto text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario integer not null check (precio_unitario >= 0),
  primary key (pedido_id, producto_id)
);
create index pedido_items_producto_idx on public.pedido_items (producto_id);
create index pedidos_creado_idx on public.pedidos (creado_en);

-- Cada cambio de estado de un pedido: quién lo hizo, cuándo y con qué nota.
create table public.pedido_historial (
  id integer generated always as identity primary key,
  pedido_id integer not null references public.pedidos (id) on delete cascade,
  estado public.estado_pedido not null,
  nota text check (char_length(nota) <= 500),
  -- NULL cuando el cambio lo originó el sistema (por ejemplo, al crear el pedido).
  administrador_id integer references public.administradores (id) on delete set null,
  creado_en timestamptz not null default now()
);
create index pedido_historial_pedido_idx on public.pedido_historial (pedido_id, creado_en);
create index pedido_historial_admin_idx on public.pedido_historial (administrador_id);

-- ---------------------------------------------------------------- Configuración

-- Datos públicos de la tienda, editables desde el panel (una sola fila).
create table public.configuracion_tienda (
  id integer primary key default 1 check (id = 1),
  telefono text check (char_length(telefono) <= 30),
  correo text check (char_length(correo) <= 254),
  direccion text check (char_length(direccion) <= 255),
  whatsapp text check (char_length(whatsapp) <= 255),
  instagram text check (char_length(instagram) <= 255),
  facebook text check (char_length(facebook) <= 255),
  -- Lista de { "dia": "Lunes - Viernes", "horario": "9:00 - 20:00" }.
  horarios jsonb not null default '[]'::jsonb check (jsonb_typeof(horarios) = 'array'),
  -- Instrucciones para pagar por transferencia (banco, cuenta, RUT...).
  datos_transferencia text check (char_length(datos_transferencia) <= 1000),
  actualizado_en timestamptz not null default now()
);
create trigger configuracion_tienda_actualizado before update on public.configuracion_tienda
  for each row execute function public.marcar_actualizado();
insert into public.configuracion_tienda (id) values (1);

-- ---------------------------------------------------------------- Sesiones

-- Sesiones del servidor Node (connect-pg-simple).
create table public.sesiones (
  sid varchar not null primary key,
  sess json not null,
  expire timestamp(6) not null
);
create index sesiones_expire_idx on public.sesiones (expire);

-- ---------------------------------------------------------------- Seguridad

alter table public.categorias enable row level security;
alter table public.familias enable row level security;
alter table public.productos enable row level security;
alter table public.clientes enable row level security;
alter table public.administradores enable row level security;
alter table public.carrito_items enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.sesiones enable row level security;
alter table public.pedido_historial enable row level security;
alter table public.configuracion_tienda enable row level security;
