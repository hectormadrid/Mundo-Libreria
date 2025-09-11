<?php
session_start();
require_once __DIR__ . '/../db/Conexion.php';

// Verificar conexión
if (!isset($conexion) || !$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

$id_usuario = (int) $_SESSION['ID'];

// Consulta SQL (con verificación de errores)
$sql = "
    SELECT p.id, p.nombre, p.precio, p.imagen, c.cantidad
    FROM carrito c
    JOIN productos p ON c.id_producto = p.id
    WHERE c.id_usuario = ?
";
$stmt = $conexion->prepare($sql);
if (!$stmt) {
    die("Error al preparar la consulta: " . $conexion->error);
}

$stmt->bind_param("i", $id_usuario);
if (!$stmt->execute()) {
    die("Error al ejecutar la consulta: " . $stmt->error);
}

$result = $stmt->get_result();
$carrito_items = [];
$total = 0;

while ($row = $result->fetch_assoc()) {
    // Asegurar tipos
    $row['precio'] = (float) $row['precio'];
    $row['cantidad'] = (int) $row['cantidad'];
    $row['subtotal'] = $row['precio'] * $row['cantidad'];

    $total += $row['subtotal'];
    $carrito_items[] = $row;
}
$stmt->close();

$hasItems = !empty($carrito_items);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../assets/MUNDO-WEB.ico">
    <title>Carrito de Compras - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../style/carrito.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'lib-red': '#E53E3E',
                        'lib-yellow': '#F6E05E',
                        'lib-blue': '#3182CE',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">

<header class="gradient-header shadow-2xl sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
            <a href="index.php" class="flex items-center group">
                <div class="ml-4">
                    <h1 class="text-3xl font-bold text-white">Mundo <span class="text-lib-yellow">Librería</span></h1>
                    <p class="text-blue-100 text-sm">Tu carrito de compras</p>
                </div>
            </a>
            <nav class="flex items-center space-x-6">
                <a href="index.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
                    <i class="fas fa-home mr-2"></i>
                    Inicio
                </a>

                <a href="../db/cerrar_sesion.php" class="text-white hover:text-lib-yellow transition-colors duration-300 flex items-center">
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Salir
                </a>
            </nav>
        </div>
    </div>
</header>

<main class="container mx-auto px-6 py-12">

    <!-- Breadcrumb -->
    <div class="flex items-center space-x-2 text-gray-600 mb-8">
        <i class="fas fa-home"></i>
        <span>Inicio</span>
        <i class="fas fa-chevron-right text-xs"></i>
        <span class="text-lib-blue font-semibold">Carrito de Compras</span>
    </div>

    <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4">
            <i class="fas fa-shopping-cart text-lib-blue mr-4"></i>
            <span class="total-gradient">Tu Carrito</span>
        </h1>
        <p class="text-gray-600 text-lg">Revisa tus productos antes de finalizar la compra</p>
    </div>

    <!-- Carrito vacío (siempre presente, se oculta cuando hay items) -->
    <div id="empty-cart" class="text-center py-12 <?= $hasItems ? 'hidden' : '' ?>">
        <i class="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-700 mb-2">¡Tu carrito está vacío!</h2>
        <p class="text-gray-500 mb-6">Agrega productos para continuar con tu compra.</p>
        <a href="index.php" class="btn-primary px-6 py-3 rounded-lg text-white">
            <i class="fas fa-store mr-2"></i> Explorar productos
        </a>
    </div>

    <!-- Carrito con productos -->
    <div id="cart-with-items" style="<?= $hasItems ? '' : 'display:none;' ?>">
        <div class="grid lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden">
                    <div class="bg-gradient-to-r from-lib-blue to-lib-red p-6">
                        <h3 class="text-2xl font-bold text-white flex items-center"><i class="fas fa-list mr-3"></i> Productos en tu Carrito</h3>
                    </div>
                    <div class="p-6 space-y-6">
                        <?php foreach ($carrito_items as $item): ?>
                            <?php // Seguridad y casteo --> ?>
                            <?php $pid = (int) $item['id']; ?>
                            <?php $nombre = htmlspecialchars($item['nombre']); ?>
                            <?php $imagen = htmlspecialchars($item['imagen']); ?>
                            <?php $precio = (float) $item['precio']; ?>
                            <?php $cantidad = (int) $item['cantidad']; ?>
                            <?php $subtotal = (int) ($item['subtotal']); ?>

                            <div class="flex items-center bg-white rounded-2xl p-6 shadow-lg card-hover border border-gray-100" id="item-<?= $pid ?>" data-qty="<?= $cantidad ?>">
                                <div class="relative">
                                    <img src="/Mundo-Libreria/uploads/productos/<?= $imagen ?>"
                                        alt="<?= $nombre ?>"
                                        class="product-image w-24 h-24 object-cover rounded-xl border-2 border-gray-200">
                                </div>
                                <div class="flex-1 ml-6">
                                    <h4 class="font-bold text-xl text-gray-800 mb-2"><?= $nombre ?></h4>
                                    <div class="flex items-center justify-between">
                                        <span class="price-highlight text-2xl font-bold">$<?= number_format($precio, 0, ',', '.') ?></span>
                                        <!-- Controles de cantidad (opcional) -->
                                    </div>
                                </div>
                                <div class="ml-6 text-right">
                                    <!-- añadimos data-value para facilitar lectura JS -->
                                    <p class="text-2xl font-bold text-lib-blue mb-4 subtotal" data-value="<?= $subtotal ?>">$<?= number_format($subtotal, 0, ',', '.') ?></p>
                                    <button onclick="eliminarDelCarrito(<?= $pid ?>)" class="btn-danger text-white px-4 py-2 rounded-lg">
                                        <i class="fas fa-trash mr-1"></i>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>

                    </div>
                </div>

                <div class="flex justify-between mt-6">
                    <a href="index.php" class="btn-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i> Seguir Comprando
                    </a>
                    <button id="clear-cart-btn" class="bg-lib-yellow text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300">
                        <i class="fas fa-broom mr-2"></i> Limpiar Carrito
                    </button>
                </div>
            </div>

            <div class="lg:col-span-1">
                <div class="glass-effect rounded-3xl shadow-2xl overflow-hidden sticky top-32">
                    <div class="bg-gradient-to-r from-lib-yellow to-lib-red p-6">
                        <h3 class="text-2xl font-bold text-gray-800 flex items-center"><i class="fas fa-calculator mr-3"></i> Resumen de Compra</h3>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">Subtotal (<span id="summary-count"><?= array_sum(array_column($carrito_items, 'cantidad') ?: [0]) ?></span> productos)</span>
                                <span id="summary-subtotal" class="font-semibold text-lg">$<?= number_format($total, 0, ',', '.') ?></span> 
                            </div>
                            <hr class="border-gray-200">
                            <div class="flex justify-between items-center">
                                <span class="text-xl font-bold text-gray-800">Total</span>
                                <span id="cart-total" class="text-3xl font-bold total-gradient">$<?= number_format($total, 0, ',', '.') ?></span>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <p class="font-semibold text-gray-700"><i class="fas fa-credit-card mr-2"></i> Métodos de Pago Aceptados</p>
                            <div class="flex space-x-2">
                                <div class="bg-blue-100 p-2 rounded-lg"><i class="fab fa-cc-visa text-blue-600 text-xl"></i></div>
                                <div class="bg-red-100 p-2 rounded-lg"><i class="fab fa-cc-mastercard text-red-600 text-xl"></i></div>
                                <div class="bg-yellow-100 p-2 rounded-lg"><i class="fas fa-university text-yellow-600 text-xl"></i></div>
                            </div>
                        </div>

                        <a href="checkout.php" class="block">
                            <button class="btn-success text-white w-full py-4 rounded-2xl font-bold text-lg"><i class="fas fa-credit-card mr-2"></i> Proceder al Pago</button>
                        </a>
                    </div>
                </div>
            </div>

        </div>
    </div>

</main>

<script src="../js/eliminarProductoCarrito.js"></script>



</body>
</html>
