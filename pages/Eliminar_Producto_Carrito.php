<?php
// eliminar_item.php
session_start();
require_once __DIR__.'/../db/Conexion.php';

// Verificar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Verificar sesión
if (!isset($_SESSION['ID'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

// Verificar que se proporcionó un ID de producto
if (!isset($_POST['id_producto'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de producto no proporcionado']);
    exit;
}

$id_usuario = $_SESSION['ID'];
$id_producto = $_POST['id_producto'];

// Preparar y ejecutar la consulta de eliminación
$sql = "DELETE FROM carrito WHERE id_usuario = ? AND id_producto = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("ii", $id_usuario, $id_producto);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al ejecutar la consulta: ' . $stmt->error]);
    exit;
}

// Verificar si se eliminó algún registro
if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'Producto eliminado del carrito']);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Producto no encontrado en el carrito']);
}

$stmt->close();
?>