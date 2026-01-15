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
    *   **Contraseña:** Elige una contraseña segura.
4.  Haz clic en el botón **"Crear Mi Cuenta"**.
5.  Si el registro es exitoso, serás redirigido a la página de inicio de sesión.

### 2.2. Iniciar Sesión

Una vez que tengas una cuenta, puedes iniciar sesión:

1.  Ve a la página de **"Iniciar Sesión"**.
2.  Ingresa tu **correo electrónico** y **contraseña**.
3.  Haz clic en **"Iniciar Sesión"**. Al conectarte, verás un saludo de bienvenida en la cabecera.

### 2.3. Navegación y Búsqueda de Productos

*   **Navegación por Categorías:** En la barra de navegación, puedes hacer clic en categorías como `Librería`, `Papelería` u `Oficina` para filtrar los productos mostrados.
*   **Búsqueda:** Utiliza la barra de búsqueda en la cabecera para encontrar productos por su nombre. Escribe lo que buscas y presiona el botón de búsqueda.

### 2.4. Agregar Productos al Carrito

Cuando encuentres un producto que te guste:

1.  Haz clic en el botón **"Agregar al carrito"** que aparece en la tarjeta del producto.
2.  El ícono del carrito de compras mostrará un número que indica cuántos artículos has agregado.

### 2.5. Ver y Gestionar el Carrito de Compras

1.  Haz clic en el ícono del **carrito de compras** para ir a la página del carrito.
2.  Aquí puedes ver todos los productos que has agregado, cambiar las cantidades o eliminar artículos.

### 2.6. Proceso de Compra (Checkout)

1.  Desde la página del carrito, haz clic en **"Proceder al Pago"**.
2.  Completa la información requerida para el envío y la facturación.
3.  Selecciona un método de pago y finaliza tu compra.

### 2.7. Gestionar tu Perfil

1.  Una vez iniciada la sesión, puedes hacer clic en **"Perfil"** en la cabecera.
2.  En tu perfil, puedes ver tu historial de pedidos y actualizar tu información personal.

### 2.8. Cerrar Sesión

Para salir de tu cuenta, haz clic en el botón **"Salir"**.

---

## 3. Guía para Administradores

Esta sección describe cómo utilizar el panel de administración para gestionar la tienda.

### 3.1. Acceso al Panel de Administración

1.  Navega a la página de inicio de sesión para administradores (generalmente en una URL como `/pages/login_admin.php`).
2.  Ingresa tus credenciales de administrador.
3.  Al iniciar sesión, serás redirigido al **Panel de Administración**.

### 3.2. Dashboard Principal

El dashboard te da una vista general de la tienda con las siguientes métricas:

*   **Total Productos:** El número total de productos en la base de datos.
*   **Activos:** El número de productos que están visibles para los clientes.
*   **Stock Bajo:** Productos cuyo inventario es inferior a 10 unidades.
*   **Valor Total:** El valor total del inventario de productos activos.

### 3.3. Gestión de Productos

La tabla de productos es la herramienta principal para gestionar tu inventario.

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

1.  En la tabla de productos, busca el producto que deseas modificar.
2.  En la columna "Acciones", haz clic en el ícono de **editar** (lápiz).
3.  Se abrirá un formulario con la información actual del producto. Modifica los campos que necesites.
4.  Haz clic en **"Guardar Cambios"**.

#### 3.3.3. Eliminar un Producto

Para evitar problemas con pedidos históricos, los productos no se borran permanentemente. En su lugar, se marcan como "Inactivos".

1.  En la tabla de productos, haz clic en el ícono de **eliminar** (papelera) en la fila del producto.
2.  Confirma la acción. El estado del producto cambiará a **"Inactivo"** y ya no será visible para los clientes.

### 3.4. Gestión de Categorías y Familias

Desde el menú lateral del panel de administración, puedes acceder a las secciones para:

*   **Gestionar Categorías:** Crear, ver, editar y eliminar las categorías principales de la tienda (ej. `Papelería`).
*   **Gestionar Familias:** Administrar las subcategorías que pertenecen a una categoría principal (ej. `Lápices` dentro de `Papelería`).

### 3.5. Gestión de Usuarios

En la sección "Usuarios", puedes ver una lista de todos los clientes registrados. Desde aquí, puedes:

*   Ver la información de un usuario.
*   Eliminar una cuenta de usuario si es necesario.

### 3.6. Gestión de Pedidos

En la sección "Pedidos", puedes:

*   Ver una lista de todos los pedidos realizados por los clientes.
*   Consultar los detalles de cada pedido (productos, dirección de envío, etc.).
*   Actualizar el estado del pedido (ej. de "Pendiente" a "Enviado").

### 3.7. Gestión de Administradores

1.  En el dashboard, haz clic en **"Gestionar Admins"**.
2.  Verás una lista de los administradores existentes y podrás eliminar cuentas.
3.  Para añadir un nuevo administrador, haz clic en **"Crear Administrador"**, completa el nombre y la contraseña, y guarda.

### 3.8. Generador de Códigos de Barras

El sistema puede generar códigos de barras automáticamente para nuevos productos. Si necesitas un código para otros propósitos, puedes usar la herramienta "Generador de Códigos" disponible en el menú.
