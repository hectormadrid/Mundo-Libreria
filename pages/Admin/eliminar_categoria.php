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

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if (empty($id)) {
    echo json_encode(['success' => false, 'error' => 'No se especificó el ID de la categoría.']);
    exit;
}

try {
    // La clave foránea en la tabla 'productos' está configurada como ON DELETE SET NULL.
    // Esto significa que al eliminar una categoría, los productos asociados no se borrarán,
    // sino que su 'id_categoria' se establecerá en NULL.
    
    $stmt = $conexion->prepare("DELETE FROM categorias WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'Categoría eliminada correctamente.']);
        } else {
            echo json_encode(['success' => false, 'error' => 'No se encontró la categoría para eliminar.']);
        }
    } else {
        // Esto podría ocurrir si hay otras restricciones de clave foránea que no conocemos
        throw new Exception('Error al eliminar la categoría. Verifique que no esté en uso en otras partes del sistema.');
    }

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
