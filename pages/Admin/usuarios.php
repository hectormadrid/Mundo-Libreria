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
            <h1 class="text-3xl font-bold">Gestión de Usuarios</h1>
            <div class="flex items-center gap-4">
                <div class="text-gray-600">Total: <span id="total-usuarios">0</span> usuarios</div>
                <button id="btnActualizar" class="bg-blue-600 text-white px-4 py-2 rounded">
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </div>
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

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../js/Admin/tablaGestionUsuario.js"></script>
    <script src="../../js/Admin/menu_admin.js"></script>
</body>

</html>