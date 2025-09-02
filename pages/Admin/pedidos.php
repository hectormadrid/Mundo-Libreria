<?php
session_start();
require_once __DIR__ . '/../../db/Conexion.php';

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

ORDER BY p.fecha DESC;
";

$result = $conexion->query($sql);
if (!$result) {
    die("Error en la consulta: " . $conexion->error);
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../../componentes/logo pestaña.ico">
    <title>Pedidos - Mundo Librería</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Tailwind CSS -->
    <link href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

    <!-- DataTables CSS -->
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.13.7/css/dataTables.tailwindcss.min.css">

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Boxicons -->
    <link href='https://unpkg.com/boxicons@2.1.1/css/boxicons.min.css' rel='stylesheet'>

    <!-- Tu CSS personalizado -->
    <link rel="stylesheet" href="../../style/Menu.css">
</head>

<body class="bg-gray-100 text-gray-900 tracking-wider leading-normal overflow-hidden">

    <!-- Sidebar -->
    <div class="sidebar close">
        <div class="logo-details">
            <box-icon name='user-circle' color="#ffffff" class="mr-3 ml-2"></box-icon>
            <span class="logo_name text-center" style='color:#ffffff'>Administrador</span>
        </div>
        <ul class="nav-links">
            <li>
                <a href="admin.php">
                    <i class='bx bx-grid-alt'></i>
                    <span class="link_name">Inicio</span>
                </a>
            </li>
            <li>
                <a href="pedidos.php" class="active">
                    <i class='bx bx-package'></i>
                    <span class="link_name">Pedidos</span>
                </a>
            </li>
            <li>
                <div class="profile-details">
                    <div class="name-job text-wrap overflow-hidden">
                        <div class="profile_name">
                            <?php echo isset($_SESSION['nombre']) ? htmlspecialchars($_SESSION['nombre']) : 'Administrador'; ?>
                        </div>
                        <a href="../../db/cerrar_sesion.php"
                            class="inline-block bg-[#3664E4] hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4 bx bx-log-out">
                        </a>
                    </div>
                </div>
            </li>
        </ul>
    </div>

    <!-- Sección principal -->
    <section class="home-section overflow-y-auto">
        <div class="home-content fixed">
            <i class='bx bx-menu'></i>
            <span class="text">Menú</span>
        </div>

        <div class="container mx-auto px-4">
            <h1 class="text-4xl md:text-5xl text-center font-serif font-bold text-black-500 mb-6 mt-6">
                Gestión de Pedidos
            </h1>

            <!-- Tabla de pedidos -->
            <div class="bg-white shadow-md rounded my-6">
                <table id="pedidosTable" class="min-w-max w-full table-auto">
                    <thead>
                        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">ID Pedido</th>
                            <th class="py-3 px-6 text-left">Cliente</th>
                            <th class="py-3 px-6 text-left">Correo</th>
                            <th class="py-3 px-6 text-center">Total</th>
                            <th class="py-3 px-6 text-center">Estado</th>
                            <th class="py-3 px-6 text-center">Fecha</th>
                            <th class="py-3 px-6 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($row = $result->fetch_assoc()): ?>
                            <tr>
                                <td class="py-3 px-6"><?= htmlspecialchars($row['id']) ?></td>
                                <td class="py-3 px-6"><?= htmlspecialchars($row['cliente']) ?></td>
                                <td class="py-3 px-6"><?= htmlspecialchars($row['correo']) ?></td>
                                <td class="py-3 px-6 text-center">$<?= number_format($row['total'], 0) ?></td>
                                <td class="py-3 px-6 text-center">
                                    <span class="px-2 py-1 rounded text-white 
                                        <?= $row['estado'] === 'pagado' ? 'bg-green-500' : 'bg-yellow-500' ?>">
                                        <?= ucfirst($row['estado']) ?>
                                    </span>
                                </td>
                                <td class="py-3 px-6 text-center"><?= $row['fecha'] ?></td>
                                <td class="py-3 px-6 text-center">
                                    <button class="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded ver-detalle"
                                        data-id="<?= $row['id'] ?>">Ver</button>
                                    <button class="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded actualizar-estado"
                                        data-id="<?= $row['id'] ?>">Actualizar</button>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
    <!-- Modal -->
    <div id="detalleModal" class="fixed inset-0 hidden bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
            <!-- Botón cerrar -->
            <button id="cerrarModal" class="absolute top-2 right-2 text-gray-500 hover:text-red-500">
            ✖
            </button>

            <h2 class="text-2xl font-bold mb-4">Detalle del Pedido</h2>
                <div id="detalleContenido" class="overflow-y-auto max-h-96">
                    <p class="text-gray-500 text-center">Cargando...</p>
                </div>
            </div>
    </div>


    <!-- DataTables -->
<script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>

<!-- Archivos propios -->
<script src="../../js/menu_admin.js"></script>
<script src="../../js/modalVerPedidos.js"></script>
<script src="../../js/tablaPedidos.js"></script>


</body>
</html>
