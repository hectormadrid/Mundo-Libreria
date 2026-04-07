<?php
require_once __DIR__ . '/../../db/SessionHelper.php';
SessionHelper::start();
require_once __DIR__ . '/../../db/Conexion.php';
require_once __DIR__ . '/../../db/SecurityHelper.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: ../login_admin.php');
    exit;
}

// Generar token CSRF si no existe
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Upload directory
$upload_dir = __DIR__ . '/../../uploads/productos/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Flash message helper
function set_flash($type, $message)
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

// Manejo de acciones POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    
    // VALIDACIÓN CSRF
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        set_flash('error', 'Error de seguridad CSRF. Inténtelo de nuevo.');
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }

    $action = $_POST['action'];

    if ($action === 'add_product') {
        // --- Recolección de datos sanitizados ---
        $nombre = SecurityHelper::sanitize($_POST['nombre'] ?? '');
        $codigo_barras = SecurityHelper::sanitize($_POST['codigo_barras'] ?? null);
        $precio = isset($_POST['precio']) ? (float)$_POST['precio'] : 0.0;
        $stock = isset($_POST['Stock']) ? (int)$_POST['Stock'] : 0;
        $descripcion = SecurityHelper::sanitize($_POST['descripcion'] ?? '');
        $marca = SecurityHelper::sanitize($_POST['marca'] ?? '');
        $color = SecurityHelper::sanitize($_POST['color'] ?? '');
        $id_categoria = isset($_POST['id_categoria']) ? (int)$_POST['id_categoria'] : null;
        $id_familia = isset($_POST['id_familia']) && !empty($_POST['id_familia']) ? (int)$_POST['id_familia'] : null;
        $estado = SecurityHelper::sanitize($_POST['estado'] ?? 'activo');

        // --- Procesamiento de la imagen SEGURO ---
        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime_type = $finfo->file($_FILES['imagen']['tmp_name']);
            $allowed_mimes = ['image/jpeg', 'image/png', 'image/webp'];

            if (!in_array($mime_type, $allowed_mimes)) {
                set_flash('error', 'El archivo no es una imagen válida (JPG, PNG, WEBP permitidos).');
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }

            if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
                set_flash('error', 'La imagen supera el límite de 2MB.');
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }

            $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            $imagenNombre = 'prod_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
            
            if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $upload_dir . $imagenNombre)) {
                set_flash('error', 'Error al guardar la imagen.');
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }
        }
        
        $sql = "INSERT INTO productos 
                    (nombre, codigo_barras, id_categoria, id_familia, imagen, descripcion, marca, color, precio, stock, estado, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $conexion->prepare($sql);
        $bind_types = "ssiisssdids";
        $stmt->bind_param($bind_types, $nombre, $codigo_barras, $id_categoria, $id_familia, $imagenNombre, $descripcion, $marca, $color, $precio, $stock, $estado);

        if ($stmt->execute()) {
            set_flash('success', 'Producto agregado correctamente');
        } else {
            set_flash('error', 'Error al agregar producto');
        }
        $stmt->close();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }

    if ($action === 'edit_product') {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        $nombre = SecurityHelper::sanitize($_POST['nombre'] ?? '');
        $precio = isset($_POST['precio']) ? (float)$_POST['precio'] : 0.0;
        $stock = isset($_POST['stock']) ? (int)$_POST['stock'] : 0;
        $descripcion = SecurityHelper::sanitize($_POST['descripcion'] ?? '');
        $id_categoria = isset($_POST['id_categoria']) ? (int)$_POST['id_categoria'] : null;
        $id_familia = isset($_POST['id_familia']) && !empty($_POST['id_familia']) ? (int)$_POST['id_familia'] : null;
        $marca = SecurityHelper::sanitize($_POST['marca'] ?? '');
        $color = SecurityHelper::sanitize($_POST['color'] ?? '');
        $estado = SecurityHelper::sanitize($_POST['estado'] ?? 'Activo');

        // Obtener imagen actual para no perderla si no suben una nueva
        $imagenNombre = null;
        $get = $conexion->prepare('SELECT imagen FROM productos WHERE id = ? LIMIT 1');
        $get->bind_param('i', $id);
        $get->execute();
        $resGet = $get->get_result();
        if ($rowG = $resGet->fetch_assoc()) {
            $imagenNombre = $rowG['imagen'];
        }
        $get->close();

        // Si suben nueva imagen, procesarla de forma segura
        if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime_type = $finfo->file($_FILES['imagen']['tmp_name']);
            if (in_array($mime_type, ['image/jpeg', 'image/png', 'image/webp'])) {
                $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
                $newName = 'prod_upd_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $upload_dir . $newName)) {
                    if (!empty($imagenNombre) && file_exists($upload_dir . $imagenNombre)) {
                        @unlink($upload_dir . $imagenNombre);
                    }
                    $imagenNombre = $newName;
                }
            }
        }

        $sql = "UPDATE productos SET nombre = ?, imagen = ?, precio = ?, descripcion = ?, id_categoria = ?, id_familia = ?, stock = ?, estado = ?, marca = ?, color = ? WHERE id = ?";
        $stmt = $conexion->prepare($sql);
        $bind_types = "ssdsiissssi";
        $stmt->bind_param($bind_types, $nombre, $imagenNombre, $precio, $descripcion, $id_categoria, $id_familia, $stock, $estado, $marca, $color, $id);
        
        if ($stmt->execute()) {
            set_flash('success', 'Producto actualizado correctamente');
        } else {
            set_flash('error', 'Error al actualizar producto');
        }
        $stmt->close();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }

    if ($action === 'delete_product') {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        // Soft delete: marcar Inactivo
        $sql = "UPDATE productos SET estado = 'Inactivo' WHERE id = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            set_flash('success', 'Producto marcado como Inactivo');
        } else {
            set_flash('error', 'Error al eliminar');
        }
        $stmt->close();
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}

// Consultas para métricas
$totalProductos = 0;
$productosActivos = 0;
$stockBajo = 0;
$valorTotal = 0.0;
$r = $conexion->query("SELECT COUNT(*) AS c FROM productos");
if ($rr = $r->fetch_assoc()) $totalProductos = $rr['c'];
$r = $conexion->query("SELECT COUNT(*) AS c FROM productos WHERE estado = 'Activo'");
if ($rr = $r->fetch_assoc()) $productosActivos = $rr['c'];
$r = $conexion->query("SELECT COUNT(*) AS c FROM productos WHERE Stock < 10 AND estado = 'Activo'");
if ($rr = $r->fetch_assoc()) $stockBajo = $rr['c'];
$r = $conexion->query("SELECT IFNULL(SUM(precio * Stock),0) AS v FROM productos WHERE estado = 'Activo'");
if ($rr = $r->fetch_assoc()) $valorTotal = $rr['v'];

// Los productos se cargan por AJAX a través de tablaAdmin.js

// Obtener categorías para los modales
$categorias = [];
$sql_cat = "SELECT id, nombre FROM categorias ORDER BY nombre ASC";
$res_cat = $conexion->query($sql_cat);
while ($row_cat = $res_cat->fetch_assoc()) {
    $categorias[] = $row_cat;
}

// Recuperar flash si existe
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin - Mundo Librería</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="../../style/admin.css">
</head>

<body class="bg-gray-100">

    <?php include '_sidebar.php'; ?>

    <section class="home-section">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 class="text-3xl font-bold">Panel de Administración</h1>
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="text-gray-600 text-sm sm:text-base">Fecha: <span id="currentTime"></span></div>
                <div class="flex items-center gap-2">
                    <button id="btnGestionarAdmins" class="bg-purple-600 text-white px-4 py-2 rounded w-full sm:w-auto">Gestionar Admins</button>
                    <button id="btnAgregarProducto" class="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">+ Nuevo Producto</button>
                </div>
            </div>
        </div>

        <!-- Sección Gestión de Administradores (inicialmente oculta) -->
        <div id="seccionGestionAdmins" class="hidden bg-white rounded shadow p-4 mb-6">
            <h2 class="text-2xl font-bold mb-4">Gestión de Administradores</h2>
            <button id="btnCrearAdmin" class="bg-green-600 text-white px-4 py-2 rounded mb-4">+ Crear Administrador</button>
            <div class="bg-white rounded shadow p-4">
                <table id="adminsTable" class="min-w-full table-auto">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-2">ID</th>
                            <th class="p-2">Nombre</th>
                            <th class="p-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Contenido cargado por AJAX -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Productos -->
            <div class="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 group">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-blue-100 text-sm font-semibold mb-1">Total Catálogo</p>
                        <h3 id="metric-total-productos" class="text-3xl font-bold text-white"><?php echo $totalProductos; ?></h3>
                        <p class="text-blue-200 text-xs mt-2"><i class="fas fa-box mr-1"></i> <?php echo $productosActivos; ?> Activos</p>
                    </div>
                    <div class="bg-blue-400 bg-opacity-30 p-4 rounded-xl group-hover:rotate-12 transition-transform">
                        <i class="fas fa-boxes text-3xl text-white"></i>
                    </div>
                </div>
            </div>

            <!-- Ventas del Mes -->
            <div class="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 group">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-green-100 text-sm font-semibold mb-1">Ventas del Mes</p>
                        <h3 id="metric-ventas-mes" class="text-3xl font-bold text-white">$0</h3>
                        <p class="text-green-200 text-xs mt-2"><i class="fas fa-chart-line mr-1"></i> Ingresos actuales</p>
                    </div>
                    <div class="bg-green-400 bg-opacity-30 p-4 rounded-xl group-hover:rotate-12 transition-transform">
                        <i class="fas fa-dollar-sign text-3xl text-white"></i>
                    </div>
                </div>
            </div>

            <!-- Pedidos Pendientes -->
            <div class="bg-gradient-to-br from-yellow-500 to-yellow-700 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                <div id="alert-pedidos" class="absolute top-2 right-2 hidden">
                    <span class="flex h-3 w-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
                <div class="flex justify-between items-center text-white">
                    <div>
                        <p class="text-yellow-100 text-sm font-semibold mb-1">Pedidos Pendientes</p>
                        <h3 id="metric-pedidos-pendientes" class="text-3xl font-bold">0</h3>
                        <a href="pedidos.php" class="text-yellow-200 text-xs mt-2 hover:underline">Gestionar pedidos <i class="fas fa-chevron-right ml-1"></i></a>
                    </div>
                    <div class="bg-yellow-400 bg-opacity-30 p-4 rounded-xl group-hover:rotate-12 transition-transform">
                        <i class="fas fa-clock text-3xl text-white"></i>
                    </div>
                </div>
            </div>

            <!-- Stock Bajo -->
            <div class="bg-gradient-to-br from-red-500 to-red-700 p-6 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 group">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-red-100 text-sm font-semibold mb-1">Alerta de Stock</p>
                        <h3 id="metric-stock-bajo" class="text-3xl font-bold text-white"><?php echo $stockBajo; ?></h3>
                        <p class="text-red-200 text-xs mt-2"><i class="fas fa-exclamation-triangle mr-1"></i> Menos de 10 unidades</p>
                    </div>
                    <div class="bg-red-400 bg-opacity-30 p-4 rounded-xl group-hover:rotate-12 transition-transform">
                        <i class="fas fa-warehouse text-3xl text-white"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full mb-8">
            <!-- Tabla de productos -->
            <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center">
                        <i class="fas fa-list mr-3 text-blue-600"></i> Inventario Completo de Productos
                    </h2>
                    <div class="flex gap-2">
                        <button onclick="window.productosTable.reload()" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Refrescar tabla">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table id="productosTable" class="min-w-full table-auto">
                        <thead>
                            <tr class="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                                <th class="p-3">ID</th>
                                <th class="p-3">Nombre</th>
                                <th class="p-3">Código</th>
                                <th class="p-3">Imagen</th>
                                <th class="p-3">Precio</th>
                                <th class="p-3">Descripcion</th>
                                <th class="p-3">Categoría</th>
                                <th class="p-3">Stock</th>
                                <th class="p-3">Estado</th>
                                <th class="p-3">Fecha</th>
                                <th class="p-3">Acciones</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </div>

    </section>
    <!-- Modal Agregar -->
    <div id="modalAgregar" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg lg:max-w-3xl xl:max-w-5xl">
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Agregar Producto</h2>
                <form id="formAgregarProducto" enctype="multipart/form-data" method="POST">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="modal-form-scrollable">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Nombre</label>
                            <input type="text" name="nombre" class="w-full px-3 py-2 border rounded">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Código de Barras</label>
                            <div class="flex">
                                <input type="text" name="codigo_barras" id="agregarCodigoBarras" class="w-full px-3 py-2 border rounded-l" placeholder="Opcional: se generará uno si se deja vacío" readonly>
                                <button type="button" id="btnGenerarCodigoBarras" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r inline-flex items-center">
                                    <i class="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Imagen del producto</label>
                        <input type="file" name="imagen" accept="image/*" class="w-full px-3 py-2 border rounded">
                        <p class="text-xs text-gray-500">Formatos: JPG, PNG, WEBP (Máx. 2MB)</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Precio</label>
                            <input type="number" name="precio" class="w-full px-3 py-2 border rounded">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Stock</label>
                            <input type="number" name="Stock" class="w-full px-3 py-2 border rounded">
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Descripción</label>
                        <textarea name="descripcion" class="w-full px-3 py-2 border rounded"></textarea>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Marca</label>
                            <input type="text" name="marca" class="w-full px-3 py-2 border rounded" placeholder="Ej: Faber-Castell">
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Color</label>
                            <input type="text" name="color" class="w-full px-3 py-2 border rounded" placeholder="Ej: Azul">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 mb-2">Categoria</label>
                            <select name="id_categoria" class="w-full px-3 py-2 border rounded" required>
                                <option value="">Seleccione una categoría</option>
                                <?php foreach ($categorias as $categoria) : ?>
                                    <option value="<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nombre']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Familia</label>
                            <select name="id_familia" class="w-full px-3 py-2 border rounded" disabled>
                                <option value="">Seleccione una categoría primero</option>
                            </select>
                        </div>
                        <div class="flex items-center pt-7">
                            <input type="checkbox" id="sinFamiliaCheckbox" name="sin_familia" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="sinFamiliaCheckbox" class="ml-2 block text-sm text-gray-900">Producto sin familia</label>
                        </div>
                        <div>
                            <label class="block text-gray-700 mb-2">Estado</label>
                            <select name="estado" class="w-full px-3 py-2 border rounded">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" id="btnCancelar" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                            Cancelar
                        </button>
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- Modal Editar -->
    <div id="modalEditar" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg lg:max-w-3xl xl:max-w-5xl p-6 relative">
            <h2 class="text-2xl font-bold mb-4">Editar Producto</h2>

            <form id="formEditarProducto" enctype="multipart/form-data" class="space-y-4">
                <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                <div class="modal-form-scrollable">
                <input type="hidden" id="editarId" name="id">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="editarNombre" class="block text-sm font-medium">Nombre</label>
                        <input type="text" id="editarNombre" name="nombre" class="w-full border rounded px-3 py-2" required>
                    </div>

                    <div>
                        <label for="editarCodigoBarras" class="block text-sm font-medium">Código de Barras</label>
                        <input type="text" id="editarCodigoBarras" name="codigo_barras" class="w-full border rounded px-3 py-2" readonly> 
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="editarPrecio" class="block text-sm font-medium">Precio</label>
                        <input type="number" id="editarPrecio" name="precio" step="0.01" class="w-full border rounded px-3 py-2" required>
                    </div>
                    <div>
                        <label for="editarStock" class="block text-sm font-medium">Stock</label>
                        <input type="number" id="editarStock" name="stock" min="0" class="w-full border rounded px-3 py-2" required>
                    </div>
                </div>

                <div>
                    <label for="editarDescripcion" class="block text-sm font-medium">Descripción</label>
                    <textarea id="editarDescripcion" name="descripcion" class="w-full border rounded px-3 py-2"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="editarMarca" class="block text-sm font-medium">Marca</label>
                        <input type="text" id="editarMarca" name="marca" class="w-full border rounded px-3 py-2" placeholder="Ej: Faber-Castell">
                    </div>
                    <div>
                        <label for="editarColor" class="block text-sm font-medium">Color</label>
                        <input type="text" id="editarColor" name="color" class="w-full border rounded px-3 py-2" placeholder="Ej: Azul">
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label for="editarCategoria" class="block text-sm font-medium">Categoría</label>
                        <select id="editarCategoria" name="id_categoria" class="w-full border rounded px-3 py-2" required>
                            <option value="">Seleccione una categoría</option>
                            <?php foreach ($categorias as $categoria) : ?>
                                <option value="<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nombre']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label for="editarFamilia" class="block text-sm font-medium">Familia</label>
                        <select id="editarFamilia" name="id_familia" class="w-full border rounded px-3 py-2">
                            <option value="">-- Sin Familia --</option>
                        </select>
                    </div>
                    <div class="flex items-center pt-5">
                            <input type="checkbox" id="editarSinFamiliaCheckbox" name="sin_familia" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="editarSinFamiliaCheckbox" class="ml-2 block text-sm text-gray-900">Producto sin familia</label>
                        </div>
                    <div>
                        <label for="editarEstado" class="block text-sm font-medium">Estado</label>
                        <select id="editarEstado" name="estado" class="w-full border rounded px-3 py-2" required>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <!-- Imagen actual -->
                <div id="imagenActualContainer" class="mt-2 hidden">
                    <label class="block text-sm font-medium">Imagen actual:</label>
                    <img id="imagenActual" src="" alt="Imagen producto" class="h-24 object-contain mt-1">
                </div>

                <!-- Nueva imagen -->
                <div>
                    <label for="editarImagen" class="block text-sm font-medium">Nueva imagen (opcional)</label>
                    <input type="file" id="editarImagen" name="imagen" accept="image/*" class="w-full border rounded px-3 py-2">
                </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" id="btnCancelarEdicion" class="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Crear Administrador -->
    <div id="modalCrearAdmin" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Crear Nuevo Administrador</h2>
                <form id="formCrearAdmin">
                    <input type="hidden" name="csrf_token" value="<?= $_SESSION['csrf_token'] ?>">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="nombre" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Contraseña</label>
                        <input type="password" name="password" class="w-full px-3 py-2 border rounded" required>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" id="btnCancelarAdmin" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                            Cancelar
                        </button>
                        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="../../js/Admin/menu_admin.js"></script>
    <script src="../../js/Admin/tablaAdmin.js"></script>
    <script src="../../js/Admin/agregarProductos.js"></script>
    <script src="../../js/Admin/editarProductos.js"></script>
    <script src="../../js/Admin/gestionAdmins.js"></script>
</body>

</html>








