<?php
require_once __DIR__ . '/../vendor/autoload.php'; use App\Helpers\SessionHelper;
SessionHelper::start();
use App\Database\Conexion; $conexion = Conexion::getConnection();
use App\Helpers\SecurityHelper;

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

$id_usuario = $_SESSION['ID'];
$id_pedido = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id_pedido <= 0) {
    header('Location: historial_pedidos.php');
    exit;
}

$pedido = null;
$detalles = [];

try {
    // 1. Obtener cabecera del pedido asegurando que pertenezca al usuario logueado (SEGURIDAD)
    $sql_pedido = "SELECT id, total, estado, fecha, metodo_pago 
                   FROM pedido 
                   WHERE id = ? AND id_usuario = ?";
    $stmt = $conexion->prepare($sql_pedido);
    $stmt->bind_param("ii", $id_pedido, $id_usuario);
    $stmt->execute();
    $result_pedido = $stmt->get_result();
    
    if ($result_pedido->num_rows === 0) {
        // El pedido no existe o no pertenece a este usuario
        header('Location: historial_pedidos.php');
        exit;
    }
    $pedido = $result_pedido->fetch_assoc();
    $stmt->close();

    // 2. Obtener los productos del pedido
    $sql_detalles = "SELECT d.cantidad, d.precio, p.nombre, p.imagen 
                     FROM detalle_pedido d 
                     JOIN productos p ON d.id_producto = p.id 
                     WHERE d.id_pedido = ?";
    $stmt_detalles = $conexion->prepare($sql_detalles);
    $stmt_detalles->bind_param("i", $id_pedido);
    $stmt_detalles->execute();
    $result_detalles = $stmt_detalles->get_result();
    
    while ($row = $result_detalles->fetch_assoc()) {
        $detalles[] = $row;
    }
    $stmt_detalles->close();

} catch (Exception $e) {
    $error = "Ocurrió un error al cargar el detalle del pedido.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="assets/MUNDO-WEB.ico">
    <title>Detalle Pedido #<?= $id_pedido ?> - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .dual-gradient {
            background: linear-gradient(135deg, #E53E3E 0%, #3182CE 100%);
        }
        .text-dual-gradient {
            background: linear-gradient(135deg, #E53E3E, #3182CE);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .gradient-header {
            background: linear-gradient(135deg, #E53E3E 0%, #3182CE 100%);
        }
    </style>
</head>
<body class="bg-gradient-to-br from-red-50 via-white to-blue-50 min-h-screen">

    <!-- Header -->
    <header class="gradient-header shadow-2xl sticky top-0 z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <a href="index.php" class="flex items-center">
                    <h1 class="text-3xl font-bold text-white">Mundo <span class="text-yellow-300">Librería</span></h1>
                </a>
                <nav class="flex items-center space-x-6">
                    <a href="historial_pedidos.php" class="text-white hover:text-yellow-300 transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Mis Pedidos
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12">
        <div class="max-w-4xl mx-auto">
            
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
                <div class="dual-gradient p-8 text-white">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 class="text-3xl font-bold">Pedido #<?= $pedido['id'] ?></h2>
                            <p class="opacity-90 mt-1"><?= date('d/m/Y H:i', strtotime($pedido['fecha'])) ?></p>
                        </div>
                        <div class="text-right">
                            <span class="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full font-bold text-lg uppercase tracking-wider">
                                <?= $pedido['estado'] ?>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div class="space-y-4">
                            <h3 class="text-xl font-bold text-gray-800 border-b pb-2">Resumen de Pago</h3>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Método de Pago:</span>
                                <span class="font-semibold text-gray-800 uppercase"><?= $pedido['metodo_pago'] ?? 'N/A' ?></span>
                            </div>
                            <div class="flex justify-between text-2xl font-bold mt-4 pt-4 border-t">
                                <span class="text-gray-800">Total Pagado:</span>
                                <span class="text-dual-gradient">$<?= number_format($pedido['total'], 0, ',', '.') ?></span>
                            </div>
                        </div>
                        <div class="bg-blue-50 p-6 rounded-2xl flex items-center justify-center">
                            <div class="text-center">
                                <i class="fas fa-shipping-fast text-4xl text-blue-600 mb-3"></i>
                                <p class="text-blue-800 font-semibold">Tu pedido está siendo procesado</p>
                                <p class="text-sm text-blue-600">Recibirás un correo cuando el estado cambie.</p>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-xl font-bold text-gray-800 mb-6">Productos en este pedido</h3>
                    <div class="space-y-4">
                        <?php foreach ($detalles as $item): ?>
                            <div class="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div class="flex items-center gap-4">
                                    <div class="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                        <?php if ($item['imagen']): ?>
                                            <img src="/Mundo-Libreria/uploads/productos/<?= htmlspecialchars($item['imagen']) ?>" 
                                                 class="w-full h-full object-cover">
                                        <?php else: ?>
                                            <i class="fas fa-image text-gray-400"></i>
                                        <?php endif; ?>
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-gray-800"><?= htmlspecialchars($item['nombre']) ?></h4>
                                        <p class="text-sm text-gray-500">Cantidad: <?= $item['cantidad'] ?></p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-semibold text-gray-600">$<?= number_format($item['precio'], 0, ',', '.') ?></p>
                                    <p class="font-bold text-gray-800">Subtotal: $<?= number_format($item['precio'] * $item['cantidad'], 0, ',', '.') ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="mt-12 flex justify-center">
                        <a href="historial_pedidos.php" 
                           class="flex items-center px-8 py-3 border-2 border-lib-blue text-lib-blue font-bold rounded-xl hover:bg-lib-blue hover:text-white transition-all">
                            <i class="fas fa-arrow-left mr-2"></i>Volver a mis pedidos
                        </a>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 Mundo Librería. Todos los derechos reservados.</p>
        </div>
    </footer>

</body>
</html>
