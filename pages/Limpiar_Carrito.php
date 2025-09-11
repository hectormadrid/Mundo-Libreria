<?php
// Limpiar_Carrito.php
session_start();
require_once __DIR__.'/../db/Conexion.php';

// Solo permitir POST
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

$id_usuario = $_SESSION['ID'];

// Preparar y ejecutar la consulta para eliminar todos los productos del usuario
$sql = "DELETE FROM carrito WHERE id_usuario = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al preparar la consulta: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("i", $id_usuario);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al ejecutar la consulta: ' . $stmt->error]);
    exit;
}

// Retornar éxito
echo json_encode(['success' => true, 'message' => 'Carrito limpiado correctamente']);

$stmt->close();
?>
