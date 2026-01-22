<?php
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: ../login_admin.php');
    exit;
}

// Helper: limpiar entrada
function clean($v)
{
    return trim(htmlspecialchars($v, ENT_QUOTES));
}

// Upload directory (ajusta si hace falta)
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
    $action = $_POST['action'];

    if ($action === 'add_product') {
        // --- Recolección de datos del formulario ---
        $nombre = clean($_POST['nombre'] ?? '');
        $codigo_barras = clean($_POST['codigo_barras'] ?? null);
        $precio = isset($_POST['precio']) ? (float)$_POST['precio'] : 0.0;
        $stock = isset($_POST['Stock']) ? (int)$_POST['Stock'] : 0; // 'Stock' con mayúscula en el form
        $descripcion = clean($_POST['descripcion'] ?? '');
        $marca = clean($_POST['marca'] ?? '');
        $color = clean($_POST['color'] ?? '');
        $id_categoria = isset($_POST['id_categoria']) ? (int)$_POST['id_categoria'] : null;
        $id_familia = isset($_POST['id_familia']) && !empty($_POST['id_familia']) ? (int)$_POST['id_familia'] : null;
        $estado = clean($_POST['estado'] ?? 'activo');

        // --- Procesamiento de la imagen ---
        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) { // Límite de 2MB
                set_flash('error', 'El archivo de imagen es demasiado grande. El límite es 2MB.');
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }
            $tmp = $_FILES['imagen']['tmp_name'];
            $ext = strtolower(pathinfo(basename($_FILES['imagen']['name']), PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            if (in_array($ext, $allowed)) {
                // Crear un nombre de archivo único y seguro
                $imagenNombre = 'producto_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
                if (!move_uploaded_file($tmp, $upload_dir . $imagenNombre)) {
                    set_flash('error', 'Error al mover el archivo de imagen.');
                    header('Location: ' . $_SERVER['PHP_SELF']);
                    exit;
                }
            } else {
                set_flash('error', 'Formato de imagen no permitido. Use JPG, JPEG, PNG o WEBP.');
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit;
            }
        }
        
        // --- Inserción en la base de datos ---
        $sql = "INSERT INTO productos 
                    (nombre, codigo_barras, id_categoria, id_familia, imagen, descripcion, marca, color, precio, stock, estado, fecha_creacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $conexion->prepare($sql);
        
        // s: string, i: integer, d: double
        $types = "ssiisssd-iss";
        $bind_types = "ssiisssdids";

        $stmt->bind_param(
            $bind_types,
            $nombre,
            $codigo_barras,
            $id_categoria,
            $id_familia,
            $imagenNombre,
            $descripcion,
            $marca,
            $color,
            $precio,
            $stock,
            $estado
        );

        if ($stmt->execute()) {
            set_flash('success', 'Producto agregado correctamente');
        } else {
            set_flash('error', 'Error al agregar producto: ' . $stmt->error);
        }
        $stmt->close();

        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }

    if ($action === 'edit_product') {
        $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
        $nombre = clean($_POST['nombre'] ?? '');
        $precio = isset($_POST['precio']) ? (float)$_POST['precio'] : 0.0;
        $descripcion = clean($_POST['descripcion'] ?? '');
        $categoria = clean($_POST['categoria'] ?? '');
        $Stock = isset($_POST['Stock']) ? (int)$_POST['Stock'] : 0;
        $estado = clean($_POST['estado'] ?? 'Activo');

        // Obtener imagen actual
        $imagenNombre = null;
        $get = $conexion->prepare('SELECT imagen FROM productos WHERE id = ? LIMIT 1');
        $get->bind_param('i', $id);
        $get->execute();
        $resGet = $get->get_result();
        if ($rowG = $resGet->fetch_assoc()) {
            $imagenNombre = $rowG['imagen'];
        }
        $get->close();

        // Si suben nueva imagen, reemplazar
        if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['imagen']['tmp_name'];
            $orig = basename($_FILES['imagen']['name']);
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            if (in_array($ext, $allowed)) {
                $newName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                move_uploaded_file($tmp, $upload_dir . $newName);
                // opcional: borrar anterior
                if (!empty($imagenNombre) && file_exists($upload_dir . $imagenNombre)) {
                    @unlink($upload_dir . $imagenNombre);
                }
                $imagenNombre = $newName;
            }
        }

        $sql = "UPDATE productos SET nombre = ?, imagen = ?, precio = ?, descripcion = ?, categoria = ?, Stock = ?, estado = ? WHERE id = ?";
        $stmt = $conexion->prepare($sql);
        $t = "ssdssisi"; // 8 params
        $stmt->bind_param($t, $nombre, $imagenNombre, $precio, $descripcion, $categoria, $Stock, $estado, $id);
        if ($stmt->execute()) {
            set_flash('success', 'Producto actualizado correctamente');
        } else {
            set_flash('error', 'Error al actualizar: ' . $stmt->error);
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
            set_flash('error', 'Error al eliminar: ' . $stmt->error);
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

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Total Productos</div>
                <div id="metric-total-productos" class="text-2xl font-bold"><?php echo $totalProductos; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Activos</div>
                <div id="metric-activos" class="text-2xl font-bold"><?php echo $productosActivos; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Stock bajo (&lt;10)</div>
                <div id="metric-stock-bajo" class="text-2xl font-bold text-red-600"><?php echo $stockBajo; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Valor total</div>
                <div id="metric-valor-total" class="text-2xl font-bold text-green-600">$<?php echo number_format((float)$valorTotal, 0, ',', '.'); ?></div>
            </div>
        </div>

        <!-- Tabla de productos -->
        <div class="bg-white rounded shadow p-4">
            <table id="productosTable" class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-2">ID</th>
                        <th class="p-2">Nombre</th>
                        <th class="p-2">Código de Barras</th>
                        <th class="p-2">Imagen</th>
                        <th class="p-2">Precio</th>
                        <th class="p-2">Descripción</th>
                        <th class="p-2">Categoria</th>
                        <th class="p-2">Stock</th>
                        <th class="p-2">Estado</th>
                        <th class="p-2">Fecha</th>
                        <th class="p-2">Acciones</th>
                    </tr>
                </thead>

            </table>
        </div>

    </section>
    <!-- Modal Agregar -->
    <div id="modalAgregar" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg lg:max-w-3xl xl:max-w-5xl">
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Agregar Producto</h2>
                <form id="formAgregarProducto" enctype="multipart/form-data" method="POST">
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








