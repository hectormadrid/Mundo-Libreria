# to_server.ps1
# Este script cambia las rutas de configuración local a configuración de servidor.

# Función para reemplazar contenido en un archivo
function Replace-FileContent {
    param (
        [string]$Path,
        [string]$OldContent,
        [string]$NewContent
    )
    (Get-Content $Path -Raw) -replace [regex]::Escape($OldContent), $NewContent | Set-Content $Path -Force
}

Write-Host "Cambiando rutas a configuración de servidor..."

# db/Conexion.php
Write-Host "Procesando db/Conexion.php..."
Replace-FileContent "db/Conexion.php" @'
<?php
// Incluir el archivo de configuración de la base de datos
require_once __DIR__ . '/../db_config.php';

// Crear la conexión a la base de datos utilizando las constantes
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Verificar la conexión
if ($conexion->connect_error) {
    // Si estamos en modo de depuración, mostrar el error detallado
    if (defined('DEBUG_MODE') && DEBUG_MODE === true) {
        $error_message = 'Error de conexión a la base de datos: ' . $conexion->connect_error;
    } else {
        // En producción, mostrar un mensaje genérico
        $error_message = 'Error de conexión a la base de datos. Por favor, inténtelo más tarde.';
    }

    // Devolver una respuesta de error genérica
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $error_message
    ]);
    exit;
}

// Establecer el juego de caracteres a UTF-8
$conexion->set_charset("utf8");
?>
'@ @'
<?php
// Datos de conexión a la base de datos
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'ingrid');
define('DB_PASSWORD', 'Hectorpola2505!');
define('DB_NAME', 'Mundo_libreria');

// Intentar conectar a la base de datos MySQL
$conexion = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Comprobar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
// Establecer el juego de caracteres a utf8 para evitar problemas con tildes y eñes
$conexion->set_charset("utf8");
?>
'@

# js/Admin/agregarProductos.js
Write-Host "Procesando js/Admin/agregarProductos.js..."
Replace-FileContent "js/Admin/agregarProductos.js" "const response = await fetch(`obtener_familias_por_categoria.php?categoria_id=${categoriaId}`);" "const response = await fetch(`/pages/Admin/obtener_familias_por_categoria.php?categoria_id=${categoriaId}`);"
Replace-FileContent "js/Admin/agregarProductos.js" '      const response = await fetch("agregar_productos.php", {' '      const response = await fetch("/pages/Admin/agregar_productos.php", {'

# js/Admin/editarProductos.js
Write-Host "Procesando js/Admin/editarProductos.js..."
Replace-FileContent "js/Admin/editarProductos.js" @'
this.imagenActual.src = `/Mundo-Libreria/uploads/productos/${product.imagen}`;
'@ @'
this.imagenActual.src = `/uploads/productos/${product.imagen}`;
'@
Replace-FileContent "js/Admin/editarProductos.js" "const response = await fetch(`obtener_familias_por_categoria.php?categoria_id=${categoryId}`);" "const response = await fetch(`/pages/Admin/obtener_familias_por_categoria.php?categoria_id=${categoryId}`);"
Replace-FileContent "js/Admin/editarProductos.js" 'const response = await fetch("editar_productos.php", {' 'const response = await fetch("/pages/Admin/editar_productos.php", {'

# js/Admin/gestionAdmins.js
Write-Host "Procesando js/Admin/gestionAdmins.js..."
Replace-FileContent "js/Admin/gestionAdmins.js" "url: 'obtener_admins.php', // Endpoint para obtener admins" "url: '/pages/Admin/obtener_admins.php', // Endpoint para obtener admins"
Replace-FileContent "js/Admin/gestionAdmins.js" "fetch('crear_administrador.php', {" "fetch('/pages/Admin/crear_administrador.php', {"
Replace-FileContent "js/Admin/gestionAdmins.js" "fetch('eliminar_administrador.php', {" "fetch('/pages/Admin/eliminar_administrador.php', {"

# js/Admin/modalVerPedidos.js
Write-Host "Procesando js/Admin/modalVerPedidos.js..."
Replace-FileContent "js/Admin/modalVerPedidos.js" '$.get("pedido_detalle.php", { id: id }, function (data) {' '$.get("/pages/Admin/pedido_detalle.php", { id: id }, function (data) {'

# js/Admin/tablaAdmin.js
Write-Host "Procesando js/Admin/tablaAdmin.js..."
Replace-FileContent "js/Admin/tablaAdmin.js" 'url: "obtener_productos.php?_t=" + new Date().getTime(), // Cache-busting' 'url: "/pages/Admin/obtener_productos.php?_t=" + new Date().getTime(), // Cache-busting'
Replace-FileContent "js/Admin/tablaAdmin.js" @'
const path = `/Mundo-Libreria/uploads/productos/${data}`;
'@ @'
const path = `/uploads/productos/${data}`;
'@
Replace-FileContent "js/Admin/tablaAdmin.js" @'
<img src="Mundo-Libreria/uploads/productos/${producto.imagen}" class="mx-auto mb-3 h-40 object-contain">
'@ @'
<img src="/uploads/productos/${producto.imagen}" class="mx-auto mb-3 h-40 object-contain">
'@
Replace-FileContent "js/Admin/tablaAdmin.js" 'const response = await fetch("actualizar_estado_producto.php", {' 'const response = await fetch("/pages/Admin/actualizar_estado_producto.php", {'
Replace-FileContent "js/Admin/tablaAdmin.js" 'const response = await fetch("obtener_metricas.php");' 'const response = await fetch("/pages/Admin/obtener_metricas.php");'

# js/Admin/tablaCategorias.js
Write-Host "Procesando js/Admin/tablaCategorias.js..."
Replace-FileContent "js/Admin/tablaCategorias.js" "url: 'obtener_categorias.php'," "url: '/pages/Admin/obtener_categorias.php',"
Replace-FileContent "js/Admin/tablaCategorias.js" "const url = id ? 'editar_categoria.php' : 'agregar_categoria.php';" "const url = id ? '/pages/Admin/editar_categoria.php' : '/pages/Admin/agregar_categoria.php';"
Replace-FileContent "js/Admin/tablaCategorias.js" "const response = await fetch('eliminar_categoria.php', {" "const response = await fetch('/pages/Admin/eliminar_categoria.php', {"

# js/Admin/tablaFamilias.js
Write-Host "Procesando js/Admin/tablaFamilias.js..."
Replace-FileContent "js/Admin/tablaFamilias.js" "url: 'obtener_familias.php', // Endpoint para obtener familias" "url: '/pages/Admin/obtener_familias.php', // Endpoint para obtener familias"
Replace-FileContent "js/Admin/tablaFamilias.js" "const url = id ? 'editar_familia.php' : 'agregar_familia.php';" "const url = id ? '/pages/Admin/editar_familia.php' : '/pages/Admin/agregar_familia.php';"
Replace-FileContent "js/Admin/tablaFamilias.js" "const response = await fetch('eliminar_familia.php', {" "const response = await fetch('/pages/Admin/eliminar_familia.php', {"

# js/Admin/tablaGestionUsuario.js
Write-Host "Procesando js/Admin/tablaGestionUsuario.js..."
Replace-FileContent "js/Admin/tablaGestionUsuario.js" "url: 'obtener_usuarios.php'," "url: '/pages/Admin/obtener_usuarios.php',"
Replace-FileContent "js/Admin/tablaGestionUsuario.js" "const response = await fetch('eliminar_usuario.php', {" "const response = await fetch('/pages/Admin/eliminar_usuario.php', {"

# js/User/cargarProductosUser.js
Write-Host "Procesando js/User/cargarProductosUser.js..."
Replace-FileContent "js/User/cargarProductosUser.js" "const response = await fetch('agregar_al_carrito.php', {" "const response = await fetch('/pages/agregar_al_carrito.php', {"
Replace-FileContent "js/User/cargarProductosUser.js" "window.location.href = 'login.php';" "window.location.href = '/pages/login.php';"
Replace-FileContent "js/User/cargarProductosUser.js" 'const response = await fetch("contador_carrito.php");' 'const response = await fetch("/pages/contador_carrito.php");'
Replace-FileContent "js/User/cargarProductosUser.js" "const response = await fetch(`obtener_familias_por_categoria.php?categoria_nombre=${categoryName}`);" "const response = await fetch(`/pages/obtener_familias_por_categoria.php?categoria_nombre=${categoryName}`);"
Replace-FileContent "js/User/cargarProductosUser.js" "let url = `obtener_prductos_user.php?categoria=${encodeURIComponent(categoria)}`;" "let url = `/pages/obtener_prductos_user.php?categoria=${encodeURIComponent(categoria)}`;"

# js/eliminarProductoCarrito.js
Write-Host "Procesando js/eliminarProductoCarrito.js..."
Replace-FileContent "js/eliminarProductoCarrito.js" "fetch('Eliminar_Producto_Carrito.php', {" "fetch('/pages/Eliminar_Producto_Carrito.php', {"
Replace-FileContent "js/eliminarProductoCarrito.js" "fetch('Limpiar_Carrito.php', { method: 'POST' })" "fetch('/pages/Limpiar_Carrito.php', { method: 'POST' })"

# pages/Admin/_sidebar.php
Write-Host "Procesando pages/Admin/_sidebar.php..."
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="admin.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/admin.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="pedidos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/pedidos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="usuarios.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/usuarios.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="categorias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/categorias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="familias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/familias.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="generador_codigos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@ @'
<a href="/pages/Admin/generador_codigos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
'@
Replace-FileContent "pages/Admin/_sidebar.php" @'
<a href="../../db/Cerrar_sesion.php" class="inline-block mt-3 bg-red-600 px-3 py-1 rounded text-white logout-btn">
'@ @'
<a href="/db/Cerrar_sesion.php" class="inline-block mt-3 bg-red-600 px-3 py-1 rounded text-white logout-btn">
'@

# pages/Admin/admin.php
Write-Host "Procesando pages/Admin/admin.php..."
Replace-FileContent "pages/Admin/admin.php" "header('Location: ../login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/admin.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/admin.php" @'
    <script src="../../js/Admin/menu_admin.js"></script>
    <script src="../../js/Admin/tablaAdmin.js"></script>
    <script src="../../js/Admin/agregarProductos.js"></script>
    <script src="../../js/Admin/editarProductos.js"></script>
    <script src="../../js/Admin/gestionAdmins.js"></script>
'@ @'
    <script src="/js/Admin/menu_admin.js"></script>
    <script src="/js/Admin/tablaAdmin.js"></script>
    <script src="/js/Admin/agregarProductos.js"></script>
    <script src="/js/Admin/editarProductos.js"></script>
    <script src="/js/Admin/gestionAdmins.js"></script>
'@

# pages/Admin/categorias.php
Write-Host "Procesando pages/Admin/categorias.php..."
Replace-FileContent "pages/Admin/categorias.php" "header('Location: ../login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/categorias.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/categorias.php" @'
    <script src="../../js/Admin/tablaCategorias.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
'@ @'
    <script src="/js/Admin/tablaCategorias.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>
'@

# pages/Admin/familias.php
Write-Host "Procesando pages/Admin/familias.php..."
Replace-FileContent "pages/Admin/familias.php" "header('Location: ../login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/familias.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/familias.php" @'
    <script src="../../js/Admin/tablaFamilias.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
'@ @'
    <script src="/js/Admin/tablaFamilias.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>
'@

# pages/Admin/generador_codigos.php
Write-Host "Procesando pages/Admin/generador_codigos.php..."
Replace-FileContent "pages/Admin/generador_codigos.php" "header('Location: ../login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/generador_codigos.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/generador_codigos.php" @'
    <script src="../../js/Admin/generadorCodigos.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
'@ @'
    <script src="/js/Admin/generadorCodigos.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>
'@

# pages/Admin/pedidos.php
Write-Host "Procesando pages/Admin/pedidos.php..."
Replace-FileContent "pages/Admin/pedidos.php" "header('Location: ../pages/login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/pedidos.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/pedidos.php" @'
     <script src="../../js/Admin/menu_admin.js"></script>
    <script src="../../js/Admin/tablaPedidos.js"></script>
    <script src="../../js/Admin/modalVerPedidos.js"></script>
'@ @'
     <script src="/js/Admin/menu_admin.js"></script>
    <script src="/js/Admin/tablaPedidos.js"></script>
    <script src="/js/Admin/modalVerPedidos.js"></script>
'@

# pages/Admin/usuarios.php
Write-Host "Procesando pages/Admin/usuarios.php..."
Replace-FileContent "pages/Admin/usuarios.php" "header('Location: ../pages/login_admin.php');" "header('Location: /pages/login_admin.php');"
Replace-FileContent "pages/Admin/usuarios.php" @'
<link rel="stylesheet" href="../../style/admin.css">
'@ @'
<link rel="stylesheet" href="/style/admin.css">
'@
Replace-FileContent "pages/Admin/usuarios.php" @'
    <script src="../../js/Admin/tablaGestionUsuario.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
'@ @'
    <script src="/js/Admin/tablaGestionUsuario.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>
'@

# pages/Carrito.php
Write-Host "Procesando pages/Carrito.php..."
Replace-FileContent "pages/Carrito.php" @'
<link rel="icon" href="../assets/MUNDO-WEB.ico">
'@ @'
<link rel="icon" href="/assets/MUNDO-WEB.ico">
'@
Replace-FileContent "pages/Carrito.php" @'
<link rel="stylesheet" href="../style/carrito.css">
'@ @'
<link rel="stylesheet" href="/style/carrito.css">
'@
Replace-FileContent "pages/Carrito.php" 'href="index.php"' 'href="/"'
Replace-FileContent "pages/Carrito.php" @'
<a href="../db/Cerrar_sesion.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
'@ @'
<a href="/db/Cerrar_sesion.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
'@
Replace-FileContent "pages/Carrito.php" @'
<img src="../uploads/productos/<?= $imagen ?>"
'@ @'
<img src="/uploads/productos/<?= $imagen ?>"
'@
Replace-FileContent "pages/Carrito.php" @'
<a href="checkout.php" class="block">
'@ @'
<a href="/pages/checkout.php" class="block">
'@
Replace-FileContent "pages/Carrito.php" @'
<script src="../js/eliminarProductoCarrito.js"></script>
'@ @'
<script src="/js/eliminarProductoCarrito.js"></script>
'@

# pages/forgot_password.php
Write-Host "Procesando pages/forgot_password.php..."
Replace-FileContent "pages/forgot_password.php" @'
<link rel="stylesheet" href="../style/login.css">
'@ @'
<link rel="stylesheet" href="/style/login.css">
'@
Replace-FileContent "pages/forgot_password.php" @'
<a href="login.php" class="text-sm text-blue-600 hover:underline">
'@ @'
<a href="/pages/login.php" class="text-sm text-blue-600 hover:underline">
'@
Replace-FileContent "pages/forgot_password.php" @'
<script src="../js/User/forgot_password.js"></script>
'@ @'
<script src="/js/User/forgot_password.js"></script>
'@

# pages/index.php
Write-Host "Procesando pages/index.php..."
Replace-FileContent "pages/index.php" @'
<link rel="icon" href="assets/MUNDO-WEB.ico">
'@ @'
<link rel="icon" href="/assets/MUNDO-WEB.ico">
'@
Replace-FileContent "pages/index.php" @'
<link rel="stylesheet" href="style/index.css">
'@ @'
<link rel="stylesheet" href="/style/index.css">
'@
Replace-FileContent "pages/index.php" @'
<img src="assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
'@ @'
<img src="/assets/MUNDO-WEB.ico" alt="Logo" class="h-8 w-8">
'@
Replace-FileContent "pages/index.php" @'
<a href="pages/perfilUser.php">perfil 
'@ @'
<a href="/pages/perfilUser.php">perfil 
'@
Replace-FileContent "pages/index.php" @'
<a href="db/Cerrar_sesion.php" class="bg-lib-red px-4 py-2 rounded-full text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg">
'@ @'
<a href="/db/Cerrar_sesion.php" class="bg-lib-red px-4 py-2 rounded-full text-white hover:bg-red-600 transition-all duration-300 hover:scale-105 shadow-lg">
'@
Replace-FileContent "pages/index.php" @'
<a href="pages/login.php" class="bg-lib-yellow text-lib-blue px-6 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
'@ @'
<a href="/pages/login.php" class="bg-lib-yellow text-lib-blue px-6 py-3 rounded-full hover:bg-yellow-400 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105">
'@
Replace-FileContent "pages/index.php" @'
<a href="pages/Carrito.php" class="fixed bottom-6 right-6 z-50 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group">
'@ @'
<a href="/pages/Carrito.php" class="fixed bottom-6 right-6 z-50 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 group">
'@
Replace-FileContent "pages/index.php" @'
<a href="index.php" data-category="all"
'@ @'
<a href="/" data-category="all"
'@
Replace-FileContent "pages/index.php" @'
  <script src="js/User/carousel.js"></script>
  <script src="js/User/components.js"></script>
  <script src="js/User/cargarProductosUser.js"></script>
  <script src="js/User/contacto.js"></script>
'@ @'
  <script src="/js/User/carousel.js"></script>
  <script src="/js/User/components.js"></script>
  <script src="/js/User/cargarProductosUser.js"></script>
  <script src="/js/User/contacto.js"></script>
'@

# pages/login.php
Write-Host "Procesando pages/login.php..."
Replace-FileContent "pages/login.php" 'header("Location: index.php");' 'header("Location: /");'
Replace-FileContent "pages/login.php" @'
<link rel="stylesheet" href="../style/login.css">
'@ @'
<link rel="stylesheet" href="/style/login.css">
'@
Replace-FileContent "pages/login.php" @'
<form action="login.php" method="post" class="space-y-6">
'@ @'
<form action="/pages/login.php" method="post" class="space-y-6">
'@
Replace-FileContent "pages/login.php" @'
<a href="forgot_password.php" class="text-lib-red hover:text-red-700 font-semibold transition-colors">
'@ @'
<a href="/pages/forgot_password.php" class="text-lib-red hover:text-red-700 font-semibold transition-colors">
'@
Replace-FileContent "pages/login.php" @'
<a href="index.php" class="admin-hover flex items-center justify-center w-full py-3 px-6 bg-gray-100 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300">
'@ @'
<a href="/" class="admin-hover flex items-center justify-center w-full py-3 px-6 bg-gray-100 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300">
'@
Replace-FileContent "pages/login.php" @'
<a href="registrar.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
'@ @'
<a href="/pages/registrar.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
'@
Replace-FileContent "pages/login.php" @'
<script src="../js/login.js"></script>
'@ @'
<script src="/js/login.js"></script>
'@

# pages/perfilUser.php
Write-Host "Procesando pages/perfilUser.php..."
Replace-FileContent "pages/perfilUser.php" @'
<link rel="icon" href="../assets/MUNDO-WEB.ico">
'@ @'
<link rel="icon" href="/assets/MUNDO-WEB.ico">
'@
Replace-FileContent "pages/perfilUser.php" @'
<link rel="stylesheet" href="../style/perfil.css">
'@ @'
<link rel="stylesheet" href="/style/perfil.css">
'@
Replace-FileContent "pages/perfilUser.php" 'href="index.php"' 'href="/"'
Replace-FileContent "pages/perfilUser.php" @'
<a href="carrito.php"
'@ @'
<a href="/pages/Carrito.php"
'@
Replace-FileContent "pages/perfilUser.php" @'
<a href="../db/Cerrar_sesion.php"
'@ @'
<a href="/db/Cerrar_sesion.php"
'@
Replace-FileContent "pages/perfilUser.php" @'
<form action="perfilUser.php" method="POST" class="space-y-6">
'@ @'
<form action="/pages/perfilUser.php" method="POST" class="space-y-6">
'@
Replace-FileContent "pages/perfilUser.php" @'
<a href="historial_pedidos.php"
'@ @'
<a href="/pages/historial_pedidos.php"
'@

# pages/registrar.php
Write-Host "Procesando pages/registrar.php..."
Replace-FileContent "pages/registrar.php" 'header("Refresh: 2; URL=login.php");' 'header("Refresh: 2; URL=/pages/login.php");'
Replace-FileContent "pages/registrar.php" @'
<link rel="stylesheet" href="../style/registrar.css">
'@ @'
<link rel="stylesheet" href="/style/registrar.css">
'@
Replace-FileContent "pages/registrar.php" @'
<form action="registrar.php" method="post" class="space-y-6">
'@ @'
<form action="/pages/registrar.php" method="post" class="space-y-6">
'@
Replace-FileContent "pages/registrar.php" @'
<a href="login.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
'@ @'
<a href="/pages/login.php" class="inline-flex items-center justify-center w-full py-3 px-6 neon-border rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300">
'@
Replace-FileContent "pages/registrar.php" @'
<script src="../js/registrar.js"></script>
'@ @'
<script src="/js/registrar.js"></script>
'@

# pages/reset_password.php
Write-Host "Procesando pages/reset_password.php..."
Replace-FileContent "pages/reset_password.php" @'
<link rel="stylesheet" href="../style/login.css">
'@ @'
<link rel="stylesheet" href="/style/login.css">
'@
Replace-FileContent "pages/reset_password.php" @'
<a href="forgot_password.php" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
'@ @'
<a href="/pages/forgot_password.php" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
'@
Replace-FileContent "pages/reset_password.php" @'
<script src="../js/User/reset_password.js"></script>
'@ @'
<script src="/js/User/reset_password.js"></script>
'@

Write-Host "Scripts de configuración de servidor creados correctamente."