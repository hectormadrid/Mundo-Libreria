<?php
session_start();
require_once __DIR__ . '/../../db/Conexion.php';
// Verificar que sea administrador
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    header('Location: ../pages/login_admin.php');
    exit;
}
// Traer pedidos con detalles
$sql = "SELECT 
  p.id,
  u.nombre AS cliente,
  u.correo,
  p.total,
  p.estado,
  p.fecha
FROM pedido p
JOIN usuario u ON p.id_usuario = u.id
ORDER BY p.fecha DESC;";

$result = $conexion->query($sql);
if (!$result) {
    die("Error en la consulta: " . $conexion->error);
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pedidos - Mundo Librería</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="../../style/admin.css">
</head>

<body class="bg-gray-100">
 <?php include '_sidebar.php'; ?>
  
    <!-- Sección principal -->
    <section class="home-section">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">Gestión de Pedidos</h1>
        </div>

        <!-- Tabla de pedidos -->
        <div class="bg-white rounded shadow p-4">
            <table id="pedidosTable" class="min-w-full table-auto">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="p-2">ID Pedido</th>
                        <th class="p-2">Cliente</th>
                        <th class="p-2">Correo</th>
                        <th class="p-2">Total</th>
                        <th class="p-2">Estado</th>
                        <th class="p-2">Fecha</th>
                        <th class="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($row = $result->fetch_assoc()): ?>
                        <tr>
                            <td class="p-2"><?= htmlspecialchars($row['id']) ?></td>
                            <td class="p-2"><?= htmlspecialchars($row['cliente']) ?></td>
                            <td class="p-2"><?= htmlspecialchars($row['correo']) ?></td>
                            <td class="p-2 text-center">$<?= number_format($row['total'], 0) ?></td>
                            <td class="p-2 text-center">
                                <span class="px-2 py-1 rounded text-white <?= $row['estado'] === 'pagado' ? 'bg-green-500' : 'bg-yellow-500' ?>">
                                    <?= ucfirst($row['estado']) ?>
                                </span>
                            </td>
                            <td class="p-2 text-center"><?= $row['fecha'] ?></td>
                            <td class="p-2 text-center">
                                <button class="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded ver-detalle" data-id="<?= $row['id'] ?>">Ver</button>
                                <button class="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded actualizar-estado" data-id="<?= $row['id'] ?>">Actualizar</button>
                            </td>
                        </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Modal Detalle -->
    <div id="detalleModal" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
            <button id="cerrarModal" class="absolute top-2 right-2 text-gray-500 hover:text-red-500">✖</button>
            <h2 class="text-2xl font-bold mb-4">Detalle del Pedido</h2>
            <div id="detalleContenido" class="overflow-y-auto max-h-96">
                <p class="text-gray-500 text-center">Cargando...</p>
            </div>
        </div>
    </div>

    <!-- Archivos propios -->
     <script src="../../js/Admin/menu_admin.js"></script>
    <script src="../../js/Admin/tablaPedidos.js"></script>
    <script src="../../js/Admin/modalVerPedidos.js"></script>
</body>
</html>