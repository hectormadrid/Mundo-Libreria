<?php
require_once __DIR__ . '/../db/SessionHelper.php';
require_once __DIR__ . '/../db/Conexion.php';
SessionHelper::start();

header('Content-Type: application/json');

if (!isset($_SESSION['carrito']) || empty($_SESSION['carrito'])) {
    echo json_encode(['success' => true, 'items' => [], 'total' => 0]);
    exit;
}

$items = [];
$total = 0;

foreach ($_SESSION['carrito'] as $id => $cantidad) {
    $stmt = $conexion->prepare("SELECT id, nombre, precio, imagen_url FROM productos WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($producto = $result->fetch_assoc()) {
        $subtotal = $producto['precio'] * $cantidad;
        $total += $subtotal;
        $items[] = [
            'id' => $producto['id'],
            'nombre' => $producto['nombre'],
            'precio' => $producto['precio'],
            'imagen' => $producto['imagen_url'],
            'cantidad' => $cantidad,
            'subtotal' => $subtotal
        ];
    }
}

echo json_encode([
    'success' => true,
    'items' => $items,
    'total' => $total,
    'cartCount' => array_sum($_SESSION['carrito'])
]);
