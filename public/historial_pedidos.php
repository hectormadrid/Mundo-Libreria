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
$pedidos = [];

// Obtener historial de pedidos del usuario
try {
    $sql = "SELECT p.id, p.total, p.estado, p.fecha 
            FROM pedido p 
            WHERE p.id_usuario = ? 
            ORDER BY p.fecha DESC";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = $row;
    }
    $stmt->close();
} catch (Exception $e) {
    $error = "No se pudo cargar el historial de pedidos.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="assets/MUNDO-WEB.ico">
    <title>Mis Pedidos - Mundo Librería</title>
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
                    <div>
                        <h1 class="text-3xl font-bold text-white">Mundo <span class="text-yellow-300">Librería</span></h1>
                    </div>
                </a>
                <nav class="flex items-center space-x-6">
                    <a href="index.php" class="text-white hover:text-yellow-300 transition-colors">
                        <i class="fas fa-home mr-2"></i>Inicio
                    </a>
                    <a href="perfilUser.php" class="text-white hover:text-yellow-300 transition-colors">
                        <i class="fas fa-user mr-2"></i>Mi Perfil
                    </a>
                    <a href="../db/Cerrar_sesion.php" class="text-white hover:text-yellow-300 transition-colors">
                        <i class="fas fa-sign-out-alt mr-2"></i>Salir
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-6 py-12">
        <div class="max-w-5xl mx-auto">
            <h1 class="text-4xl font-bold text-center mb-12 text-dual-gradient">
                <i class="fas fa-shopping-bag mr-3"></i>Mis Pedidos
            </h1>

            <?php if (empty($pedidos)): ?>
                <div class="bg-white rounded-3xl shadow-xl p-12 text-center">
                    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-box-open text-4xl text-gray-400"></i>
                    </div>
                    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Aún no tienes pedidos</h2>
                    <p class="text-gray-500 mb-8">¡Explora nuestra tienda y encuentra lo que necesitas!</p>
                    <a href="index.php" class="inline-block dual-gradient text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                        Ir a la tienda
                    </a>
                </div>
            <?php else: ?>
                <div class="space-y-6">
                    <?php foreach ($pedidos as $pedido): ?>
                        <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                            <div class="p-6 md:p-8">
                                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <p class="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pedido #<?= $pedido['id'] ?></p>
                                        <p class="text-lg font-bold text-gray-800"><?= date('d/m/Y H:i', strtotime($pedido['fecha'])) ?></p>
                                    </div>
                                    <div class="flex items-center gap-6">
                                        <div class="text-right">
                                            <p class="text-sm text-gray-500">Total</p>
                                            <p class="text-2xl font-bold text-dual-gradient">$<?= number_format($pedido['total'], 0, ',', '.') ?></p>
                                        </div>
                                        <div>
                                            <?php 
                                            $estado_clase = '';
                                            $estado_texto = ucfirst($pedido['estado']);
                                            switch($pedido['estado']) {
                                                case 'pagado': $estado_clase = 'bg-green-100 text-green-700'; break;
                                                case 'pendiente': $estado_clase = 'bg-yellow-100 text-yellow-700'; break;
                                                case 'cancelado': $estado_clase = 'bg-red-100 text-red-700'; break;
                                            }
                                            ?>
                                            <span class="px-4 py-2 rounded-full text-sm font-bold <?= $estado_clase ?>">
                                                <?= $estado_texto ?>
                                            </span>
                                        </div>
                                        <a href="pedido_detalle_user.php?id=<?= $pedido['id'] ?>" 
                                           class="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-4 text-center">
            <p>&copy; 2025 Mundo Librería. Todos los derechos reservados.</p>
        </div>
    </footer>

</body>
</html>
