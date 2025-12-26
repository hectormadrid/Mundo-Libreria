<?php
header('Content-Type: application/json');
require_once __DIR__.'/../../db/Conexion.php';

session_start();
if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Acceso no autorizado.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener datos del cuerpo de la solicitud JSON
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID de familia no válido.']);
    exit;
}

try {
    // No es necesario verificar si la familia está en uso en productos,
    // porque la FK en `productos` tiene `ON DELETE SET NULL`.
    // Al eliminar la familia, el campo `id_familia` en los productos asociados se pondrá a NULL automáticamente.

    $stmt = $conexion->prepare("DELETE FROM familias WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Familia eliminada correctamente.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'La familia no fue encontrada.']);
        }
    } else {
        throw new Exception('Error al eliminar la familia: ' . $stmt->error);
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Error del servidor: " . $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conexion)) $conexion->close();
}
