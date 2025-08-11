<?php
session_start();
require_once __DIR__.'/../db/Conexion.php';

// Verificar conexión
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    header('Location: login.php');
    exit;
}

$id_usuario = $_SESSION['ID'];

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
    $row['subtotal'] = $row['precio'] * $row['cantidad'];
    $total += $row['subtotal'];
    $carrito_items[] = $row;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../assets/MUNDO-WEB.ico">
    <title>Carrito de Compras - Mundo Librería</title>
    <script src="https://cdn.tailwindcss.com"></script>
     <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'lib-red': '#E53E3E', // Rojo vibrante
            'lib-yellow': '#F6E05E', // Amarillo claro
            'lib-blue': '#3182CE', // Azul sólido
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
            <div class="flex items-center space-x-4">
                <a href="index.php" class="text-white hover:text-lib-yellow">Inicio</a>
                <a href="carrito.php" class="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <!-- Aquí se podría agregar un contador de items -->
                </a>
            </div>
        </div>
    </header>

    <main class="container mx-auto mt-10 p-4">
        <h1 class="text-3xl font-bold mb-6">Tu Carrito de Compras</h1>

        <?php if (empty($carrito_items)): ?>
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                <p class="text-gray-600">Tu carrito está vacío.</p>
                <a href="index.php" class="mt-4 inline-block bg-lib-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700">Volver a la tienda</a>
            </div>
        <?php else: ?>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <table class="w-full text-left">
                    <thead>
                        <tr>
                            <th class="py-2">Producto</th>
                            <th class="py-2">Precio</th>
                            <th class="py-2">Cantidad</th>
                            <th class="py-2">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($carrito_items as $item): ?>
                            <tr class="border-b">
                                <td class="py-4 flex items-center">
                                    <img src="/Mundo-Libreria/uploads/productos/<?= htmlspecialchars($item['imagen']) ?>" alt="<?= htmlspecialchars($item['nombre']) ?>" class="w-16 h-16 object-cover mr-4">
                                    <span><?= htmlspecialchars($item['nombre']) ?></span>
                                </td>
                                <td class="py-4">$<?= number_format($item['precio'], 0, ',', '.') ?></td>
                                <td class="py-4"><?= $item['cantidad'] ?></td>
                                <td class="py-4">$<?= number_format($item['subtotal'], 0, ',', '.') ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <div class="mt-6 text-right">
                    <h2 class="text-2xl font-bold">Total: $<?= number_format($total, 0, ',', '.') ?></h2>
                    <button class="mt-4 bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600">Proceder al Pago</button>
                </div>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
