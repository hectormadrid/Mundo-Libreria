<?php
session_start();
require_once __DIR__.'/../db/Conexion.php';

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

$id_usuario = $_SESSION['ID'];

// Obtener productos del carrito
$sql = "SELECT p.id, p.nombre, p.precio, c.cantidad, (p.precio * c.cantidad) as subtotal
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
<body class="bg-gray-100">

  <!-- Header -->
  <header class="bg-lib-blue text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a href="index.php" class="flex items-center">
        <img src="../assets/logo.ico" alt="Logo" class="h-10 mr-3">
        <h1 class="text-2xl font-bold">Mundo <span class="text-lib-yellow">Librería</span></h1>
      </a>
      <a href="carrito.php" class="hover:text-lib-yellow">Carrito</a>
    </div>
  </header>

  <main class="container mx-auto mt-10 p-6">
    <h1 class="text-3xl font-bold mb-6">Procesar Pago</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Formulario -->
      <div class="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Datos de facturación</h2>
        <form action="checkout_process.php" method="POST" class="space-y-4">
          <div>
            <label class="block font-semibold">Nombre Completo</label>
            <input type="text" name="nombre" required class="w-full p-2 border rounded-lg">
          </div>
          <div>
            <label class="block font-semibold">Correo Electrónico</label>
            <input type="email" name="correo" required class="w-full p-2 border rounded-lg">
          </div>
          <div>
            <label class="block font-semibold">Dirección</label>
            <input type="text" name="direccion" required class="w-full p-2 border rounded-lg">
          </div>
          <div>
            <label class="block font-semibold">Método de Pago</label>
            <select name="metodo_pago" class="w-full p-2 border rounded-lg">
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="pago_efectivo">Pago En Efectivo</option>
            </select>
          </div>
          <button type="submit" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-bold">
            Confirmar Pago
          </button>
        </form>
      </div>

      <!-- Resumen -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Resumen del Pedido</h2>
        <ul class="divide-y">
          <?php foreach ($items as $item): ?>
            <li class="py-2 flex justify-between">
              <span><?= htmlspecialchars($item['nombre']) ?> (x<?= $item['cantidad'] ?>)</span>
              <span>$<?= number_format($item['subtotal'], 0, ',', '.') ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
        <div class="mt-4 border-t pt-4 text-right">
          <h3 class="text-2xl font-bold">Total: $<?= number_format($total, 0, ',', '.') ?></h3>
        </div>
      </div>
    </div>
  </main>

</body>
</html>
