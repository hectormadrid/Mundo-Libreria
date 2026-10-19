# Manual de Usuario: Mundo Librería

## 1. Introducción

Bienvenido al manual de usuario de la plataforma de e-commerce "Mundo Librería". Este documento proporciona una guía detallada sobre cómo utilizar las funcionalidades del sitio, tanto para los clientes que desean comprar productos como para los administradores que gestionan la plataforma.

---

## 2. Guía para Clientes

Esta sección está dedicada a los usuarios que visitan la tienda para comprar productos.

### 2.1. Registro de una Cuenta Nueva

Para comprar en Mundo Librería, necesitas una cuenta. Sigue estos pasos para registrarte:

1.  Haz clic en el botón **"Iniciar Sesión"** en la esquina superior derecha de la página de inicio.
2.  En la página de inicio de sesión, busca y haz clic en el enlace para **registrarse**.
3.  Completa el formulario de registro con la siguiente información:
    *   **Nombre Completo:** Tu nombre y apellido.
    *   **RUT:** Tu Rol Único Tributario.
    *   **Correo Electrónico:** Una dirección de correo válida.
    *   **Teléfono:** Tu número de contacto.
    *   **Contraseña:** Mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial.
4.  Haz clic en el botón **"Crear cuenta"**.
5.  Si el registro es exitoso, serás redirigido a la página de inicio de sesión.

### 2.2. Iniciar Sesión

Una vez que tengas una cuenta, puedes iniciar sesión:

1.  Ve a la página de **"Iniciar Sesión"**.
2.  Ingresa tu **correo electrónico** y **contraseña**.
3.  Haz clic en **"Iniciar Sesión"**. Al conectarte, verás un saludo de bienvenida en la cabecera.

### 2.3. Navegación y Búsqueda de Productos

*   **Navegación por Categorías:** En la barra de navegación, puedes hacer clic en categorías como `Librería`, `Papelería` u `Oficina` para filtrar los productos mostrados. Dentro de una categoría aparecen sus familias (por ejemplo `Lápices`) para filtrar aún más.
*   **Búsqueda:** Utiliza la barra de búsqueda en la cabecera para encontrar productos por nombre, descripción o marca. Los resultados se actualizan mientras escribes.
*   **Más productos:** Al final de la lista, el botón **"Cargar más productos"** muestra el resto del catálogo.

### 2.4. Agregar Productos al Carrito

Cuando encuentres un producto que te guste:

1.  Haz clic en **"Agregar"** en la tarjeta del producto, o abre el producto, elige la cantidad y haz clic en **"Añadir al carrito"**.
2.  Se abrirá el carrito lateral con tus productos, y el ícono del carrito mostrará cuántos artículos llevas.

Si no has iniciado sesión, el sistema te pedirá hacerlo y luego te devolverá al producto.

### 2.5. Ver y Gestionar el Carrito de Compras

1.  Haz clic en el ícono del **carrito** y luego en **"Ver carrito completo"**.
2.  Aquí puedes cambiar las cantidades con los botones **−** y **+**, eliminar artículos o vaciar el carrito.

### 2.6. Proceso de Compra (Checkout)

1.  Desde el carrito, haz clic en **"Proceder al pago"**.
2.  Revisa tus datos de contacto y la dirección de envío (se completan con los datos de tu perfil).
3.  Elige el método de pago y haz clic en **"Confirmar pedido"**:
    *   **Transferencia:** el pedido queda *Pendiente* hasta que la tienda confirme el pago.
    *   **Efectivo:** pagas al recibir; el pedido queda *Pendiente*.
    *   **Tarjeta:** actualmente funciona en modo de prueba (no se realiza ningún cargo real).
4.  Recibirás un correo con el detalle de tu pedido.

### 2.7. Gestionar tu Perfil y tus Pedidos

1.  Una vez iniciada la sesión, haz clic en tu nombre en la cabecera para abrir tu **perfil**, donde puedes actualizar tu nombre, teléfono y dirección.
2.  El ícono de paquete abre **"Mis pedidos"**, con el estado y el detalle de cada compra.

### 2.8. Recuperar tu Contraseña

1.  En la página de inicio de sesión, haz clic en **"¿La olvidaste?"**.
2.  Ingresa tu correo; recibirás un enlace válido por 1 hora para crear una nueva contraseña.

### 2.9. Cerrar Sesión

Para salir de tu cuenta, haz clic en el botón **"Salir"**.

---

## 3. Guía para Administradores

Esta sección describe cómo utilizar el panel de administración para gestionar la tienda.

### 3.1. Acceso al Panel de Administración

La tienda no muestra ningún enlace al panel: los administradores entran por el mismo inicio de sesión que los clientes.

1.  Haz clic en **"Iniciar sesión"** en la cabecera de la tienda (o abre directamente la dirección de la tienda seguida de `/admin`).
2.  En el campo **"Correo electrónico"** escribe tu **usuario de administrador** (por ejemplo `ingrid`) y luego tu contraseña. Tras 5 intentos fallidos, el acceso se bloquea durante 15 minutos.
3.  Entrarás directo al **Panel de Administración**. El menú lateral da acceso a todas las secciones, y **"Ver tienda"** te lleva de vuelta a la tienda.
4.  Mientras tengas la sesión de administrador abierta, la cabecera de la tienda muestra el botón **"Panel admin"**.

### 3.2. Dashboard

Es la primera pantalla del panel. Arriba eliges el período: **7 días, 30 días, 90 días o 12 meses**.

*   **Indicadores:** ventas, pedidos, ticket promedio y clientes nuevos, cada uno con su variación respecto del período anterior (flecha verde si subió, roja si bajó). Las ventas y el ticket promedio cuentan solo pedidos pagados, enviados o entregados.
*   **Requiere atención:** pagos por confirmar (y el monto en espera), pedidos pagados por enviar, productos agotados y con stock bajo. Cada tarjeta te lleva directo a la lista filtrada.
*   **Gráfico de ventas:** por día, semana o mes según el período. Pasa el cursor sobre una columna para ver el monto y la cantidad de pedidos; el botón **"Ver tabla"** muestra los mismos datos como tabla.
*   **Ventas por categoría** y **productos más vendidos** del período.
*   **Stock crítico** y **últimos pedidos**.

El menú lateral muestra contadores en **Pedidos** (pagos por confirmar + pedidos por enviar) y en **Productos** (stock bajo). Se actualizan solos cada minuto.

Todas las fechas se calculan en hora de Chile.

### 3.3. Gestión de Productos

*   **Resumen y filtros:** arriba ves cuántos productos hay en total, visibles, ocultos, con stock bajo y agotados (clic en cada uno para filtrar). También puedes filtrar por categoría, estado y stock, y buscar por nombre, código o marca.
*   **Ajuste rápido de stock:** haz clic en el número de stock de un producto, escribe la nueva cantidad y presiona **Enter** (o **Esc** para cancelar).
*   **Unidades vendidas:** la columna **Vendidos** muestra cuántas unidades se han vendido de cada producto (sin contar pedidos cancelados).
*   **Acciones en lote:** marca varios productos con las casillas y usa la barra que aparece abajo para **mostrarlos**, **ocultarlos** o **exportarlos**.
*   **Exportar:** el botón **"Exportar"** descarga un archivo CSV (se abre en Excel) con los productos filtrados.
*   **Etiqueta:** el ícono de código de barras de cada fila abre el generador de etiquetas con ese producto ya elegido.

#### 3.3.1. Agregar un Nuevo Producto

1.  Haz clic en el botón **"+ Nuevo Producto"**.
2.  Se abrirá un formulario donde deberás completar los siguientes campos:
    *   **Nombre:** Nombre del producto.
    *   **Código de Barras:** Opcional. Si lo dejas en blanco, el sistema generará uno automáticamente.
    *   **Imagen:** Sube una imagen para el producto (JPG, PNG, WEBP).
    *   **Precio y Stock:** Define el precio y la cantidad inicial.
    *   **Descripción, Marca, Color:** Añade detalles adicionales.
    *   **Categoría y Familia:** Asigna el producto a una categoría y, opcionalmente, a una familia (subcategoría).
    *   **Estado:** `Activo` (visible en la tienda) o `Inactivo` (oculto).
3.  Haz clic en **"Guardar"** para añadir el producto.

#### 3.3.2. Editar un Producto

1.  En la tabla de productos, busca el producto (puedes filtrar por nombre, código o categoría y ordenar por cualquier columna).
2.  En la columna "Acciones", haz clic en **Editar**.
3.  Se abrirá un formulario con la información actual del producto. Modifica los campos que necesites.
4.  Haz clic en **"Guardar"**.

#### 3.3.3. Ocultar un Producto

Para no afectar los pedidos históricos, los productos no se borran. En su lugar se marcan como "Inactivos".

1.  En la columna **Estado**, haz clic en la etiqueta **Visible** del producto.
2.  El producto pasará a **Oculto** y dejará de verse en la tienda. Haz clic de nuevo para volver a mostrarlo.

### 3.4. Gestión de Categorías y Familias

Desde el menú lateral del panel de administración, puedes acceder a las secciones para:

*   **Gestionar Categorías:** Crear, ver, editar y eliminar las categorías principales de la tienda (ej. `Papelería`).
*   **Gestionar Familias:** Administrar las subcategorías que pertenecen a una categoría principal (ej. `Lápices` dentro de `Papelería`).

### 3.5. Gestión de Clientes

En la sección **"Clientes"** ves a todos los clientes registrados, con su cantidad de pedidos, **total pagado**, último pedido y fecha de registro (ordenados por los que más han comprado).

*   **Ficha del cliente:** haz clic en su nombre para ver sus datos, sus totales y todos sus pedidos (cada uno enlaza a su detalle).
*   **Editar** su información (RUT, nombre, correo, teléfono y dirección).
*   **Eliminar** una cuenta. Los clientes que tienen pedidos no se pueden eliminar, para conservar el historial de ventas.
*   **Exportar** la lista a CSV.

### 3.6. Gestión de Pedidos

*   **Pestañas por estado** (Todos, Pendiente, Pagado, Enviado, Entregado, Cancelado) con la cantidad de pedidos en cada una, y un filtro por fecha (últimos 7, 30 o 90 días).
*   Haz clic en **"Gestionar"** para abrir la ficha del pedido: datos de contacto y envío, productos, total e **historial** de todos sus cambios (quién lo hizo, cuándo y con qué nota).
*   **Actualizar el pedido:** elige el nuevo estado (el formulario sugiere el siguiente paso habitual), escribe una nota opcional (por ejemplo el número de seguimiento del despacho) y marca **"Avisar al cliente por correo"** si quieres que reciba un aviso; la nota se incluye en ese correo. También puedes dejar el mismo estado y solo agregar una nota.
*   El cliente ve el **seguimiento** de su pedido (estados y fechas) en "Mis pedidos".
*   **Exportar** los pedidos filtrados a CSV.

Al **cancelar** un pedido, el stock de sus productos vuelve al inventario. Un pedido cancelado no se puede reactivar.

### 3.7. Gestión de Administradores

1.  En el menú lateral, entra a **"Administradores"**.
2.  Verás la lista de administradores y podrás eliminar cuentas (no puedes eliminar tu propia cuenta ni la última que quede).
3.  Para añadir uno nuevo, haz clic en **"Nuevo administrador"**, completa el usuario y una contraseña segura, y guarda. El usuario no puede ser un correo (no puede contener `@`), porque se escribe en el mismo campo que el correo de los clientes.

### 3.8. Generador de Códigos de Barras

El sistema genera códigos de barras automáticamente para los productos nuevos. Para imprimir una etiqueta, entra a **"Códigos de barras"** en el menú, elige el producto y haz clic en **"Imprimir etiqueta"**.

### 3.9. Configuración de la Tienda

En **Ajustes → Tienda** editas los datos que ven tus clientes, sin tocar el código:

*   **Contacto:** teléfono, correo y dirección (página de Contacto).
*   **Horarios de atención:** filas de "días" y "horario" que aparecen en el pie de página (agrega o quita filas).
*   **Redes sociales:** enlaces de WhatsApp, Instagram y Facebook. Si dejas uno vacío, su ícono no se muestra.
*   **Datos para transferencia:** banco, cuenta, RUT, etc. Se muestran en el checkout al elegir transferencia y se incluyen en el correo de confirmación del pedido.

Haz clic en **"Guardar cambios"**: se reflejan de inmediato en la tienda.
