<?php
require_once __DIR__ . '/../db/SessionHelper.php';
require_once __DIR__ . '/../db/Conexion.php';
SessionHelper::start();

header('Content-Type: application/json');

// Si el usuario no ha iniciado sesión, el carrito estará vacío (según la lógica actual del sistema)
if (!isset($_SESSION['ID'])) {
    echo json_encode(['success' => true, 'items' => [], 'total' => 0, 'cartCount' => 0]);
    exit;
}

$id_usuario = $_SESSION['ID'];
$items = [];
$total = 0;

try {
    // Consultar los productos del carrito del usuario desde la base de datos
    $query = "SELECT c.cantidad, p.id, p.nombre, p.precio, p.imagen 
              FROM carrito c 
              JOIN productos p ON c.id_producto = p.id 
              WHERE c.id_usuario = ?";
    
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($producto = $result->fetch_assoc()) {
        $subtotal = $producto['precio'] * $producto['cantidad'];
        $total += $subtotal;
        
        // Construir la ruta de la imagen. Si no hay imagen, usar un placeholder o dejar vacío
        $ruta_imagen = !empty($producto['imagen']) 
            ? "/Mundo-Libreria/uploads/productos/" . $producto['imagen'] 
            : "/Mundo-Libreria/assets/placeholder_producto.png";

        $items[] = [
            'id' => $producto['id'],
            'nombre' => $producto['nombre'],
            'precio' => (float)$producto['precio'],
            'imagen' => $ruta_imagen,
            'cantidad' => (int)$producto['cantidad'],
            'subtotal' => (float)$subtotal
        ];
    }

    $cartCount = array_sum(array_column($items, 'cantidad'));

    echo json_encode([
        'success' => true,
        'items' => $items,
        'total' => (float)$total,
        'cartCount' => $cartCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener el carrito: ' . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
