<?php

session_start();


require_once __DIR__ . '/../../db/Conexion.php';
// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: ../pages/login_admin.php');
    exit;
}
$stmt = $conexion->prepare("SELECT nombre FROM Administrador WHERE id = ?");
$stmt->bind_param("i", $_SESSION['ID']);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $_SESSION['nombre'] = $row['nombre'];
}

?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Usuarios - Mundo Librería</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../../style/admin.css">
</head>

<body class="bg-gray-100">

<?php include '_sidebar.php'; ?>

<section class="home-section">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Gestión de Usuarios</h1>
    </div>

    <!-- Tabla de usuarios -->
    <div class="bg-white rounded shadow p-4">
            <table id="usuariosTable" class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-3">ID</th>
                        <th class="p-3">RUT</th>
                        <th class="p-3">Nombre</th>
                        <th class="p-3">Correo</th>
                        <th class="p-3">Teléfono</th>
                        <th class="p-3">Dirección</th>
                        <th class="p-3">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Los datos se cargarán via AJAX -->
                </tbody>
            </table>
        </div>
    </section>

    <!-- Modal de confirmación para eliminar -->
    <div id="modalEliminarUsuario" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p class="mb-4">¿Estás seguro que deseas eliminar al usuario <span id="usuarioNombre" class="font-semibold"></span>?</p>
            <p class="text-sm text-red-600 mb-4">Esta acción no se puede deshacer.</p>
            <div class="flex justify-end gap-3">
                <button type="button" onclick="cerrarModal('modalEliminarUsuario')"
                    class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                    Cancelar
                </button>
                <button type="button" id="btnConfirmarEliminar"
                    class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal para Editar Usuario -->
    <div id="modalEditarUsuario" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 class="text-xl font-bold mb-6">Editar Usuario</h3>
            <form id="formEditarUsuario">
                <input type="hidden" id="editUsuarioId" name="id">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="editRut" class="block text-sm font-medium text-gray-700">RUT</label>
                        <input type="text" id="editRut" name="rut" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="editNombre" class="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" id="editNombre" name="nombre" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="editCorreo" class="block text-sm font-medium text-gray-700">Correo</label>
                        <input type="email" id="editCorreo" name="correo" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div>
                        <label for="editTelefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="text" id="editTelefono" name="telefono" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="md:col-span-2">
                        <label for="editDireccion" class="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" id="editDireccion" name="direccion" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" onclick="cerrarModal('modalEditarUsuario')" class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../js/Admin/tablaGestionUsuario.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
</body>

</html>








