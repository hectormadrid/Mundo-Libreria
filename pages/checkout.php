<?php
session_start();
require_once __DIR__ . '/../db/Conexion.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
  header('Location: login.php');
  exit;
}

$id_usuario = $_SESSION['ID'];

// Obtener productos del carrito
$sql = "SELECT p.id, p.imagen, p.nombre, p.precio, c.cantidad, (p.precio * c.cantidad) as subtotal
        FROM carrito c
        JOIN productos p ON c.id_producto = p.id
        WHERE c.id_usuario = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
$total = 0;
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
  $total += $row['subtotal'];
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="../assets/MUNDO-WEB.ico">
  <title>Procesar Pago - Mundo Librería</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="../style/checkout.css">
</head>

<body class="min-h-screen" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">

  <!-- Header mejorado -->
  <header class="gradient-blue shadow-2xl sticky top-0 z-50">
    <div class="container mx-auto px-6 py-4">
      <div class="flex justify-between items-center">
        <a href="index.php" class="flex items-center group">
          <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <i class="fas fa-book text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">Mundo <span class="text-yellow-300">Librería</span></h1>
            <p class="text-blue-200 text-sm">Tu tienda de libros favorita</p>
          </div>
        </a>

        <nav class="hidden md:flex items-center space-x-6">
          <a href="index.php" class="text-white hover:text-yellow-300 transition-colors">
            <i class="fas fa-home mr-2"></i>Inicio
          </a>
          <a href="carrito.php" class="text-white hover:text-yellow-300 transition-colors">
            <i class="fas fa-shopping-cart mr-2"></i>Carrito
          </a>
        </nav>

        <!-- Mobile menu button -->
        <button class="md:hidden text-white">
          <i class="fas fa-bars text-2xl"></i>
        </button>
      </div>
    </div>
  </header>


  <main class="container mx-auto px-6 pb-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Formulario  -->
      <div class="lg:col-span-2 space-y-6 py-3.5">
        <!-- Información de contacto -->
        <div class="glass-effect rounded-2xl p-8 card-shadow hover-lift fade-in-up">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 gradient-blue rounded-full flex items-center justify-center mr-4">
              <i class="fas fa-user text-white text-xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Información de Contacto</h2>
          </div>

          <form id="checkoutForm" action="checkout_process.php" method="POST" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="input-group">
                <input type="text" name="nombre" placeholder=" " required>
                <label>Nombre Completo</label>
              </div>
              <div class="input-group">
                <input type="email" name="correo" placeholder=" " required>
                <label>Correo Electrónico</label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="input-group">
                <input type="tel" name="telefono" placeholder=" ">
                <label>Teléfono (Opcional)</label>
              </div>
              <div class="input-group">
                <input type="text" name="rut" placeholder=" ">
                <label>RUT (Opcional)</label>
              </div>
            </div>
          </form>
        </div>

        <!-- Método de pago -->
        <div class="glass-effect rounded-2xl p-8 card-shadow hover-lift fade-in-up">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 gradient-blue rounded-full flex items-center justify-center mr-4">
              <i class="fas fa-credit-card text-white text-xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Método de Pago</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="payment-card" data-method="transferencia">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-university text-blue-600 text-2xl"></i>
                </div>
                <h3 class="font-bold text-gray-800 mb-2">Transferencia</h3>
                <p class="text-sm text-gray-600">Pago directo a cuenta bancaria</p>
                <div class="mt-3">
                  <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    <i class="fas fa-check mr-1"></i>Seguro
                  </span>
                </div>
              </div>
            </div>

            <div class="payment-card" data-method="tarjeta">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-credit-card text-purple-600 text-2xl"></i>
                </div>
                <h3 class="font-bold text-gray-800 mb-2">Tarjeta</h3>
                <p class="text-sm text-gray-600">Crédito o débito</p>
                <div class="mt-3 flex justify-center space-x-1">
                  <i class="fab fa-cc-visa text-blue-600"></i>
                  <i class="fab fa-cc-mastercard text-red-600"></i>
                  <i class="fab fa-cc-amex text-blue-800"></i>
                </div>
              </div>
            </div>

            <div class="payment-card" data-method="efectivo">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-money-bill-wave text-green-600 text-2xl"></i>
                </div>
                <h3 class="font-bold text-gray-800 mb-2">Efectivo</h3>
                <p class="text-sm text-gray-600">Pago al recibir</p>
                <div class="mt-3">
                  <span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    <i class="fas fa-truck mr-1"></i>Entrega
                  </span>
                </div>
              </div>
            </div>
          </div>

          <input type="hidden" name="metodo_pago" id="selectedPaymentMethod" value="transferencia">
        </div>
      </div>

      <!-- Resumen del pedido  -->
      <div class="space-y-6">
        <div class="glass-effect rounded-2xl p-8 card-shadow hover-lift slide-in-right sticky top-24">
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 gradient-green rounded-full flex items-center justify-center mr-4">
              <i class="fas fa-receipt text-white text-xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800">Resumen del Pedido</h2>
          </div>

          <!-- Lista de productos -->
          <?php foreach ($items as $item): ?>
            <?php $imagen = htmlspecialchars($item['imagen']); ?>
            <div class="order-item">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <img src="/Mundo-Libreria/uploads/productos/<?= $imagen ?>"
                        >
                </div>
                <div>
                  <p class="font-semibold text-gray-800"><?= htmlspecialchars($item['nombre']) ?></p>
                  <p class="text-sm text-gray-600">Cantidad: <?= $item['cantidad'] ?></p>
                </div>
              </div>
              <span class="font-bold text-gray-800">$<?= number_format($item['subtotal'], 0, ',', '.') ?></span>
            </div>
          <?php endforeach; ?>

          <!-- Desglose de costos -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span id="subtotal">$63.500</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Envío</span>
              <span class="text-green-600 font-semibold">Gratis</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Descuento</span>
              <span class="text-red-600">-$0</span>
            </div>
            <hr class="border-gray-300">
            <div class="flex justify-between text-xl font-bold text-gray-800">
              <span>Total</span>
              <span id="cart-total" class="text-3xl font-bold total-gradient">$<?= number_format($total, 0, ',', '.') ?></span>
            </div>
          </div>

          <!-- Botón de confirmación -->
          <button type="submit" form="checkoutForm"
            class="w-full gradient-green text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg">
            <i class="fas fa-lock mr-2"></i>
            Confirmar Pago Seguro
          </button>
        </div>
      </div>
    </div>
    </div>
  </main>

  <script src="../js/User/checkout.js"></script>
</body>

</html>