<?php
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: /pages/login_admin.php');
    exit;
}

// Obtener categorías para el dropdown del modal
$categorias = [];
$sql_cat = "SELECT id, nombre FROM categorias ORDER BY nombre ASC";
$res_cat = $conexion->query($sql_cat);
while ($row_cat = $res_cat->fetch_assoc()) {
    $categorias[] = $row_cat;
}
$conexion->close();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Familias - Mundo Librería</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="/style/admin.css">
</head>

<body class="bg-gray-100">

    <?php include '_sidebar.php'; ?>

    <section class="home-section">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">Gestión de Familias de Productos</h1>
            <button id="btnNuevaFamilia" class="bg-blue-600 text-white px-4 py-2 rounded">+ Nueva Familia</button>
        </div>

        <!-- Tabla de familias -->
        <div class="bg-white rounded shadow p-4">
            <table id="familiasTable" class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-3">ID</th>
                        <th class="p-3">Nombre</th>
                        <th class="p-3">Categoría Padre</th>
                        <th class="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Los datos se cargarán via AJAX -->
                </tbody>
            </table>
        </div>
    </section>

    <!-- Modal para Agregar/Editar Familia -->
    <div id="modalFamilia" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 id="modalFamiliaTitulo" class="text-xl font-bold mb-4">Nueva Familia</h3>
            <form id="formFamilia">
                <input type="hidden" id="familiaId" name="id">
                <div class="mb-4">
                    <label for="familiaNombre" class="block text-gray-700 mb-2">Nombre de la Familia</label>
                    <input type="text" id="familiaNombre" name="nombre" class="w-full px-3 py-2 border rounded" required>
                </div>
                <div class="mb-4">
                    <label for="familiaCategoria" class="block text-gray-700 mb-2">Categoría Padre</label>
                    <select id="familiaCategoria" name="id_categoria" class="w-full px-3 py-2 border rounded" required>
                        <option value="">Seleccione una categoría</option>
                        <?php foreach ($categorias as $categoria) : ?>
                            <option value="<?php echo $categoria['id']; ?>"><?php echo htmlspecialchars($categoria['nombre']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="flex justify-end gap-3">
                    <button type="button" id="btnCancelarFamilia" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/Admin/tablaFamilias.js"></script>
    <script src="/js/Admin/menu_admin.js"></script>
</body>

</html>