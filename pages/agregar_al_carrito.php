<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__.'/../db/Conexion.php';

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['ID'])) {
    http_response_code(401); // No autorizado
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

// Obtener el cuerpo de la solicitud (que debería ser JSON)
$data = json_decode(file_get_contents('php://input'), true);
$id_producto = $data['id_producto'] ?? null;

if (!$id_producto) {
    http_response_code(400); // Solicitud incorrecta
    echo json_encode(['success' => false, 'error' => 'ID de producto no proporcionado']);
    exit;
}

$id_usuario = $_SESSION['ID'];

try {
    // Verificar si el producto ya está en el carrito del usuario
    $stmt = $conexion->prepare("SELECT id, cantidad FROM carrito WHERE id_usuario = ? AND id_producto = ?");
    $stmt->bind_param("ii", $id_usuario, $id_producto);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Si el producto ya está, actualizar la cantidad
        $row = $result->fetch_assoc();
        $nueva_cantidad = $row['cantidad'] + 1;
        $stmt_update = $conexion->prepare("UPDATE carrito SET cantidad = ? WHERE id = ?");
        $stmt_update->bind_param("ii", $nueva_cantidad, $row['id']);
        $stmt_update->execute();
    } else {
        // Si el producto no está, insertarlo
        $stmt_insert = $conexion->prepare("INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, 1)");
        $stmt_insert->bind_param("ii", $id_usuario, $id_producto);
        $stmt_insert->execute();
    }

    // OBTENER EL NUEVO CONTEO TOTAL DE PRODUCTOS EN EL CARRITO
    $stmt_count = $conexion->prepare("SELECT SUM(cantidad) as total_items FROM carrito WHERE id_usuario = ?");
    $stmt_count->bind_param("i", $id_usuario);
    $stmt_count->execute();
    $count_result = $stmt_count->get_result();
    $total_items = $count_result->fetch_assoc()['total_items'] ?? 0;

    echo json_encode([
        'success' => true, 
        'message' => 'Producto agregado al carrito',
        'cartCount' => (int)$total_items // Devuelve el conteo total
    ]);

} catch (Exception $e) {
    http_response_code(500); // Error del servidor
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>