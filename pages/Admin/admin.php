<?php
session_start();
require_once __DIR__ . '/../../db/Conexion.php'; // <-- ajusta la ruta según tu proyecto

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
        $nombre = clean($_POST['nombre'] ?? '');
        $precio = isset($_POST['precio']) ? (float)$_POST['precio'] : 0.0;
        $descripcion = clean($_POST['descripcion'] ?? '');
        $categoria = clean($_POST['categoria'] ?? '');
        $Stock = isset($_POST['Stock']) ? (int)$_POST['Stock'] : 0;
        $estado = clean($_POST['estado'] ?? 'Activo');

        // Procesar imagen
        $imagenNombre = null;
        if (!empty($_FILES['imagen']['name']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['imagen']['tmp_name'];
            $orig = basename($_FILES['imagen']['name']);
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            if (in_array($ext, $allowed)) {
                $imagenNombre = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                move_uploaded_file($tmp, $upload_dir . $imagenNombre);
            }
        }

        $sql = "INSERT INTO productos (nombre, imagen, precio, descripcion, categoria, Stock, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $conexion->prepare($sql);
        $t = "ssdssis"; // nombre(s), imagen(s), precio(d), descripcion(s), categoria(s), Stock(i), estado(s) -> total 7
        $stmt->bind_param($t, $nombre, $imagenNombre, $precio, $descripcion, $categoria, $Stock, $estado);
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

// Obtener productos para tabla
$productos = [];
$sql = "SELECT id, nombre, imagen, precio, descripcion, categoria, Stock, estado, fecha_creacion FROM productos ORDER BY id DESC";
$res = $conexion->query($sql);
while ($row = $res->fetch_assoc()) {
    $productos[] = $row;
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

    <!-- Botón toggle mejorado -->
    <button class="sidebar-toggle fixed top-4 left-4 z-50 bg-blue-600 p-2 rounded-lg text-white shadow-lg md:left-4 transition-all duration-300 hover:bg-blue-700">
        <!-- Icono de hamburguesa -->
        <svg class="w-6 h-6 open-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>

        <!-- Icono de X -->
        <svg class="w-6 h-6 close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
    </button>


    <div class="sidebar" id="sidebar">
        <!-- Tu contenido actual del sidebar -->
        <div class="logo-details text-white mb-6">
            <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                </svg>
                <span class="font-bold text-lg logo-text px-3">Mundo Librería</span>
            </div>
        </div>
        <div class="nav-links space-y-2">
            <!-- Item simple -->
            <a href="admin.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
                <i class="fas fa-home text-white mr-3 w-5 text-center"></i>
                <span class="nav-text text-white">Inicio</span>
            </a>

            <!-- Item simple -->
            <a href="pedidos.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
                <i class="fas fa-box text-white mr-3 w-5 text-center"></i>
                <span class="nav-text text-white">Pedidos</span>
            </a>

          <a href="usuarios.php" class="nav-item flex items-center p-3 rounded-lg transition-all">
                <i class="fas fa-users text-white mr-3 w-5 text-center"></i>
                <span class="nav-text text-white">Usuarios</span>
            </a>

        </div>

        <div class="mt-8 text-white user-section">
            <div class="font-semibold user-name"><?php echo htmlspecialchars($_SESSION['nombre'] ?? 'Administrador'); ?></div>
            <a href="../../db/cerrar_sesion.php" class="inline-block mt-3 bg-red-600 px-3 py-1 rounded text-white logout-btn">
                Cerrar sesión
            </a>
        </div>
    </div>

    <section class="home-section">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">Panel de Administración</h1>
            <div class="flex items-center gap-4">
                <div class="text-gray-600">Fecha: <span id="currentTime"></span></div>
                <button id="btnAgregarProducto" class="bg-blue-600 text-white px-4 py-2 rounded">+ Nuevo</button>
            </div>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Total Productos</div>
                <div class="text-2xl font-bold"><?php echo $totalProductos; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Activos</div>
                <div class="text-2xl font-bold"><?php echo $productosActivos; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Stock bajo (&lt;10)</div>
                <div class="text-2xl font-bold text-red-600"><?php echo $stockBajo; ?></div>
            </div>
            <div class="p-4 bg-white rounded shadow">
                <div class="text-sm text-gray-500">Valor total</div>
                <div class="text-2xl font-bold text-green-600">$<?php echo number_format((float)$valorTotal, 0, ',', '.'); ?></div>
            </div>
        </div>

        <!-- Tabla de productos -->
        <div class="bg-white rounded shadow p-4">
            <table id="productosTable" class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-2">ID</th>
                        <th class="p-2">Nombre</th>
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
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4">Agregar Producto</h2>
                <form id="formAgregarProducto" enctype="multipart/form-data" method="POST">
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Nombre</label>
                        <input type="text" name="nombre" class="w-full px-3 py-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Imagen del producto</label>
                        <input type="file" name="imagen" accept="image/*" class="w-full px-3 py-2 border rounded">
                        <p class="text-xs text-gray-500">Formatos: JPG, PNG, WEBP (Máx. 2MB)</p>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Precio</label>
                        <input type="number" name="precio" class="w-full px-3 py-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Descripción</label>
                        <textarea name="descripcion" class="w-full px-3 py-2 border rounded"></textarea>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Categoria</label>
                        <select name="categoria" class="w-full px-3 py-2 border rounded">
                            <option value="Libreria">Libreria</option>
                            <option value="Oficina">Oficina</option>
                            <option value="Papeleria">Papeleria</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Stock</label>
                        <input type="number" name="Stock" class="w-full px-3 py-2 border rounded">
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 mb-2">Estado</label>
                        <select name="estado" class="w-full px-3 py-2 border rounded">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
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
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <h2 class="text-2xl font-bold mb-4">Editar Producto</h2>

            <form id="formEditarProducto" enctype="multipart/form-data" class="space-y-4">
                <input type="hidden" id="editarId" name="id">

                <div>
                    <label for="editarNombre" class="block text-sm font-medium">Nombre</label>
                    <input type="text" id="editarNombre" name="nombre" class="w-full border rounded px-3 py-2" required>
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

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="editarCategoria" class="block text-sm font-medium">Categoría</label>
                        <select id="editarCategoria" name="categoria" class="w-full border rounded px-3 py-2" required>
                            <option value="">Seleccionar</option>
                            <option value="Libreria">Librería</option>
                            <option value="Papeleria">Papelería</option>
                            <option value="Oficina">Oficina</option>
                        </select>
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

                <!-- Botones -->
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" id="btnCancelarEdicion" class="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>

    <script src="../../js/Admin/menu_admin.js"></script>
    <script src="../../js/Admin/tablaAdmin.js"></script>
    <script src="../../js/Admin/agregarProductos.js"></script>
    <script src="../../js/Admin/editarProductos.js"></script>
</body>

</html>