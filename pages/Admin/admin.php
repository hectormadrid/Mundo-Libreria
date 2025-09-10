<?php
/*
Plan (pseudocódigo) - versión inicial funcional
1) Incluir sesión y conexión a BD.
2) Procesar requests POST (acciones): add_product, edit_product, delete_product.
   - Validar campos, procesar imagen si viene, mover a carpeta uploads/productos
   - Insertar / actualizar / marcar Inactivo según corresponda
   - Después de CRUD redirect para evitar reenvío de formularios
3) Consultar métricas: total productos, activos, stock bajo, valor total
4) Consultar lista completa de productos y mostrarlos en la tabla
5) Frontend: modales para agregar, editar y confirmar eliminación
   - preview de imágenes
   - poblar modal editar con atributos data-* desde la fila
   - inicializar DataTables
   - togglear sidebar, mostrar hora, notificaciones (placeholders)

NOTAS:
- Ajusta la ruta a Conexion.php si tu estructura de carpetas es distinta.
- Asegúrate de tener la carpeta uploads/productos con permisos de escritura.
- Esta versión es "todo en un archivo" para facilitar pruebas. Podemos mover endpoints a archivos separados después.
*/

session_start();
require_once __DIR__ . '/../../db/Conexion.php'; // <-- ajusta la ruta según tu proyecto

// Helper: limpiar entrada
function clean($v) {
    return trim(htmlspecialchars($v, ENT_QUOTES));
}

// Upload directory (ajusta si hace falta)
$upload_dir = __DIR__ . '/../../uploads/productos/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Flash message helper
function set_flash($type, $message) {
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
            $allowed = ['jpg','jpeg','png','webp'];
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
            $allowed = ['jpg','jpeg','png','webp'];
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
$totalProductos = 0; $productosActivos = 0; $stockBajo = 0; $valorTotal = 0.0;
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
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        /* Pequeños ajustes visuales */
        .sidebar { background: linear-gradient(180deg,#1f2937,#111827); width: 260px; height:100vh; position:fixed; left:0; top:0; padding:20px; }
        .sidebar.close { width:72px }
        .home-section { margin-left:260px; padding:20px; }
        .sidebar .nav-links a { display:flex; gap:10px; align-items:center; color:#fff; padding:8px 10px; border-radius:8px; }
        .sidebar .nav-links a:hover { background: rgba(255,255,255,0.04); }
        .badge-active { background:#D1FAE5; color:#065f46; padding:4px 8px; border-radius:999px; font-weight:600; }
        .badge-inactive { background:#FEE2E2; color:#991B1B; padding:4px 8px; border-radius:999px; font-weight:600; }
    </style>
</head>
<body class="bg-gray-100">

<div class="sidebar" id="sidebar">
    <div class="logo-details text-white mb-6">
        <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5z"></path></svg>
            <span class="font-bold text-lg">Mundo Librería</span>
        </div>
    </div>
    <div class="nav-links space-y-2">
        <a href="admin.php" class="flex items-center"><i class="fas fa-home text-white mr-2"></i><span class="text-white">Inicio</span></a>
        <a href="pedidos.php" class="flex items-center"><i class="fas fa-box text-white mr-2"></i><span class="text-white">Pedidos</span></a>
        <a href="#" class="flex items-center"><i class="fas fa-users text-white mr-2"></i><span class="text-white">Usuarios</span></a>
    </div>
    <div class="mt-8 text-white">
        <div class="font-semibold"><?php echo htmlspecialchars($_SESSION['nombre'] ?? 'Administrador'); ?></div>
        <a href="../../db/cerrar_sesion.php" class="inline-block mt-3 bg-red-600 px-3 py-1 rounded text-white">Cerrar sesión</a>
    </div>
</div>

<section class="home-section">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Panel de Administración</h1>
        <div class="flex items-center gap-4">
            <div class="text-gray-600">Fecha: <span id="currentTime"></span></div>
            <button id="btnAgregarProductoTop" class="bg-blue-600 text-white px-4 py-2 rounded">+ Nuevo</button>
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

    <!-- Filtros simples -->
    <div class="mb-4 bg-white p-4 rounded shadow">
        <div class="flex gap-4">
            <input id="searchProduct" class="border rounded px-3 py-2 w-1/3" placeholder="Buscar...">
            <select id="filterCategory" class="border rounded px-3 py-2">
                <option value="">Todas las categorías</option>
                <option value="Libreria">Librería</option>
                <option value="Oficina">Oficina</option>
                <option value="Papeleria">Papelería</option>
            </select>
            <button id="btnRefresh" class="ml-auto bg-green-500 text-white px-4 py-2 rounded">Actualizar</button>
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
                    <th class="p-2">Categoria</th>
                    <th class="p-2">Stock</th>
                    <th class="p-2">Estado</th>
                    <th class="p-2">Fecha</th>
                    <th class="p-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($productos as $p): ?>
                    <tr>
                        <td class="p-2"><?php echo $p['id']; ?></td>
                        <td class="p-2"><?php echo htmlspecialchars($p['nombre']); ?></td>
                        <td class="p-2 text-center">
                            <?php if (!empty($p['imagen']) && file_exists($upload_dir . $p['imagen'])): ?>
                                <img src="<?php echo str_replace($_SERVER['DOCUMENT_ROOT'], '', $upload_dir) . $p['imagen']; ?>" alt="" style="height:60px; object-fit:contain;">
                            <?php elseif (!empty($p['imagen'])): ?>
                                <img src="/uploads/productos/<?php echo $p['imagen']; ?>" alt="" style="height:60px; object-fit:contain;">
                            <?php else: ?>
                                <span class="text-gray-400">Sin imagen</span>
                            <?php endif; ?>
                        </td>
                        <td class="p-2">$<?php echo number_format((float)$p['precio'], 0, ',', '.'); ?></td>
                        <td class="p-2"><?php echo htmlspecialchars($p['categoria']); ?></td>
                        <td class="p-2 text-center"><?php echo (int)$p['Stock']; ?></td>
                        <td class="p-2 text-center">
                            <?php if ($p['estado'] === 'Activo'): ?>
                                <span class="badge-active">Activo</span>
                            <?php else: ?>
                                <span class="badge-inactive">Inactivo</span>
                            <?php endif; ?>
                        </td>
                        <td class="p-2"><?php echo htmlspecialchars($p['fecha_creacion']); ?></td>
                        <td class="p-2">
                            <div class="flex gap-2 justify-center">
                                <button class="btn-edit bg-yellow-400 px-3 py-1 rounded" 
                                    data-id="<?php echo $p['id']; ?>"
                                    data-nombre="<?php echo htmlspecialchars($p['nombre'], ENT_QUOTES); ?>"
                                    data-precio="<?php echo $p['precio']; ?>"
                                    data-descripcion="<?php echo htmlspecialchars($p['descripcion'], ENT_QUOTES); ?>"
                                    data-categoria="<?php echo htmlspecialchars($p['categoria'], ENT_QUOTES); ?>"
                                    data-stock="<?php echo (int)$p['Stock']; ?>"
                                    data-estado="<?php echo htmlspecialchars($p['estado'], ENT_QUOTES); ?>"
                                    data-imagen="<?php echo htmlspecialchars($p['imagen'], ENT_QUOTES); ?>"
                                >Editar</button>

                                <button class="btn-delete bg-red-500 text-white px-3 py-1 rounded" data-id="<?php echo $p['id']; ?>">Eliminar</button>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

</section>

<!-- Modal Agregar -->
<div id="modalAgregar" class="fixed inset-0 hidden items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded p-6 w-full max-w-3xl">
        <h3 class="text-xl font-bold mb-4">Agregar Producto</h3>
        <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="action" value="add_product">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="nombre" placeholder="Nombre" class="border p-2 rounded" required>
                <input name="precio" type="number" step="0.01" placeholder="Precio" class="border p-2 rounded" required>
                <textarea name="descripcion" placeholder="Descripción" class="border p-2 rounded md:col-span-2"></textarea>
                <select name="categoria" class="border p-2 rounded">
                    <option value="Libreria">Librería</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Papeleria">Papelería</option>
                </select>
                <input name="Stock" type="number" min="0" class="border p-2 rounded" placeholder="Stock">
                <select name="estado" class="border p-2 rounded">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
                <input type="file" name="imagen" accept="image/*" onchange="previewImageAdd(this)" class="md:col-span-2">
                <div id="previewAdd" class="md:col-span-2 hidden mt-2"><img id="previewAddImg" src="" style="max-height:120px"></div>
            </div>
            <div class="mt-4 flex justify-end gap-2">
                <button type="button" onclick="closeModal('modalAgregar')" class="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal Editar -->
<div id="modalEditar" class="fixed inset-0 hidden items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded p-6 w-full max-w-3xl">
        <h3 class="text-xl font-bold mb-4">Editar Producto</h3>
        <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="action" value="edit_product">
            <input type="hidden" name="id" id="editId">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="nombre" id="editNombre" placeholder="Nombre" class="border p-2 rounded" required>
                <input name="precio" id="editPrecio" type="number" step="0.01" placeholder="Precio" class="border p-2 rounded" required>
                <textarea name="descripcion" id="editDescripcion" placeholder="Descripción" class="border p-2 rounded md:col-span-2"></textarea>
                <select name="categoria" id="editCategoria" class="border p-2 rounded">
                    <option value="Libreria">Librería</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Papeleria">Papelería</option>
                </select>
                <input name="Stock" id="editStock" type="number" min="0" class="border p-2 rounded" placeholder="Stock">
                <select name="estado" id="editEstado" class="border p-2 rounded">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
                <input type="file" name="imagen" id="editImagen" accept="image/*" onchange="previewImageEdit(this)" class="md:col-span-2">
                <div id="previewEdit" class="md:col-span-2 hidden mt-2"><img id="previewEditImg" src="" style="max-height:120px"></div>
            </div>
            <div class="mt-4 flex justify-end gap-2">
                <button type="button" onclick="closeModal('modalEditar')" class="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar cambios</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal Eliminar -->
<div id="modalEliminar" class="fixed inset-0 hidden items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Confirmar eliminación</h3>
        <p class="mb-4">¿Estás seguro que deseas marcar este producto como Inactivo?</p>
        <form method="post">
            <input type="hidden" name="action" value="delete_product">
            <input type="hidden" name="id" id="deleteId">
            <div class="flex justify-end gap-2">
                <button type="button" onclick="closeModal('modalEliminar')" class="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-red-600 text-white rounded">Confirmar</button>
            </div>
        </form>
    </div>
</div>

<script>
// Mostrar flash con SweetAlert
const flash = <?php echo json_encode($flash); ?>;
if (flash) {
    if (flash.type === 'success') Swal.fire('Éxito', flash.message, 'success');
    else if (flash.type === 'error') Swal.fire('Error', flash.message, 'error');
}

// Inicializar DataTable
$(document).ready(function() {
    $('#productosTable').DataTable({
        paging: true,
        searching: true,
        info: false,
        order: [[0, 'desc']],
        columnDefs: [ { orderable: false, targets: [2,8] } ]
    });
});

// Sidebar toggle (si lo deseas)
function toggleSidebar() {
    const s = document.getElementById('sidebar');
    s.classList.toggle('close');
    const home = document.querySelector('.home-section');
    if (s.classList.contains('close')) home.style.marginLeft = '72px'; else home.style.marginLeft = '260px';
}

// Abrir modal
function openModal(id) { document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex'); }
function closeModal(id) { document.getElementById(id).classList.remove('flex'); document.getElementById(id).classList.add('hidden'); }

// Botones
document.getElementById('btnAgregarProductoTop').addEventListener('click', () => openModal('modalAgregar'));

// Editar - poblar modal desde data-*
document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        document.getElementById('editId').value = id;
        document.getElementById('editNombre').value = btn.dataset.nombre;
        document.getElementById('editPrecio').value = btn.dataset.precio;
        document.getElementById('editDescripcion').value = btn.dataset.descripcion;
        document.getElementById('editCategoria').value = btn.dataset.categoria;
        document.getElementById('editStock').value = btn.dataset.stock;
        document.getElementById('editEstado').value = btn.dataset.estado;
        // preview imagen si existe
        const img = btn.dataset.imagen;
        if (img) {
            const preview = document.getElementById('previewEdit');
            document.getElementById('previewEditImg').src = '/uploads/productos/' + img;
            preview.classList.remove('hidden');
        } else {
            document.getElementById('previewEdit').classList.add('hidden');
        }
        openModal('modalEditar');
    });
});

// Eliminar - abrir modal con id
document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('deleteId').value = btn.dataset.id;
        openModal('modalEliminar');
    });
});

// Previews
function previewImageAdd(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { document.getElementById('previewAddImg').src = e.target.result; document.getElementById('previewAdd').classList.remove('hidden'); }
    reader.readAsDataURL(file);
}
function previewImageEdit(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { document.getElementById('previewEditImg').src = e.target.result; document.getElementById('previewEdit').classList.remove('hidden'); }
    reader.readAsDataURL(file);
}

// Hora actual
function updateTime() { const el = document.getElementById('currentTime'); el.textContent = new Date().toLocaleString(); }
updateTime(); setInterval(updateTime, 1000);

// Botón refresh (recarga la página)
document.getElementById('btnRefresh').addEventListener('click', () => location.reload());

</script>

</body>
</html>
